package com.fastgondulas.backend.service.freight;

import com.fastgondulas.backend.domain.dto.freight.VolumetricResultDTO;
import com.fastgondulas.backend.domain.dto.pdf.CargoItemDTO;
import com.fastgondulas.backend.domain.logistica.FatorAjuste;
import com.fastgondulas.backend.domain.logistica.FatorMontagem;
import com.fastgondulas.backend.domain.logistica.ParametroFrete;
import com.fastgondulas.backend.domain.logistica.StatusMontagem;
import com.fastgondulas.backend.domain.logistica.TipoVeiculo;
import com.fastgondulas.backend.repository.FatorMontagemRepository;
import com.fastgondulas.backend.repository.ParametroFreteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * Regras de volumetria baseadas nas planilhas Excel do projeto.
 *
 * Linha Seca (QTD_POR_M3):
 *   volumeUnitario = 1 / qtdPorM3
 *   volumeBruto = qtd * volumeUnitario
 *   volumeAjustado = volumeBruto * fatorAjuste * fatorMontagem
 *   mts = volumeTotal * fatorMetroM3  (padrão 0.2 = 12/60)
 *   mtsNvia = mts * (1 + margemNvia)
 *   mtsVenda = mtsNvia * (1 + margemVenda)
 *
 * Linha Fria (DIMENSAO_FISICA):
 *   volumeUnitario = comprimento * largura * altura
 *   volumeBruto = qtd * volumeUnitario
 *   mts via fatorMetroM3 da tabela
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VolumetricCalculationService {

    private static final BigDecimal FATOR_M3_PADRAO = new BigDecimal("0.2");

    private final FatorMontagemRepository fatorMontagemRepository;
    private final ParametroFreteRepository parametroFreteRepository;

    public VolumetricResultDTO calcular(List<CargoItemDTO> itens,
                                        StatusMontagem statusMontagem,
                                        TipoVeiculo tipoVeiculo) {
        if (itens == null || itens.isEmpty()) {
            return new VolumetricResultDTO(
                    BigDecimal.ZERO, BigDecimal.ZERO,
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0
            );
        }

        ParametroFrete parametro = buscarParametroVigente(tipoVeiculo);
        BigDecimal fatorMetroM3 = parametro != null ? parametro.getFatorMetroM3() : FATOR_M3_PADRAO;
        BigDecimal margemNvia = parametro != null ? parametro.getMargemNvia() : new BigDecimal("0.10");
        BigDecimal margemVenda = parametro != null ? parametro.getMargemVenda() : new BigDecimal("0.20");
        BigDecimal fatorMontagem = buscarFatorMontagem(statusMontagem);

        BigDecimal volumeTotal = BigDecimal.ZERO;
        BigDecimal pesoTotal = BigDecimal.ZERO;

        for (CargoItemDTO item : itens) {
            BigDecimal qtd = nvl(item.quantidade(), BigDecimal.ONE);
            BigDecimal volItem = calcularVolumeItem(item, fatorMontagem);
            volumeTotal = volumeTotal.add(volItem);

            if (item.pesoTotalKg() != null) {
                pesoTotal = pesoTotal.add(item.pesoTotalKg());
            } else if (item.pesoUnitarioKg() != null) {
                pesoTotal = pesoTotal.add(item.pesoUnitarioKg().multiply(qtd));
            }
        }

        BigDecimal mts = volumeTotal.multiply(fatorMetroM3).setScale(6, RoundingMode.HALF_UP);
        BigDecimal mtsNvia = mts.multiply(BigDecimal.ONE.add(margemNvia)).setScale(6, RoundingMode.HALF_UP);
        BigDecimal mtsVenda = mtsNvia.multiply(BigDecimal.ONE.add(margemVenda)).setScale(6, RoundingMode.HALF_UP);

        log.info("Volumetria: totalM3={}, pesoKg={}, mts={}, mtsNvia={}, mtsVenda={}",
                volumeTotal, pesoTotal, mts, mtsNvia, mtsVenda);

        return new VolumetricResultDTO(
                volumeTotal.setScale(8, RoundingMode.HALF_UP),
                pesoTotal.setScale(3, RoundingMode.HALF_UP),
                mts,
                mtsNvia,
                mtsVenda,
                itens.size()
        );
    }

    private BigDecimal calcularVolumeItem(CargoItemDTO item, BigDecimal fatorMontagem) {
        BigDecimal qtd = nvl(item.quantidade(), BigDecimal.ONE);

        // Linha fria: usa dimensões físicas
        if (item.comprimentoM() != null && item.larguraM() != null && item.alturaM() != null) {
            BigDecimal volUnitario = item.comprimentoM()
                    .multiply(item.larguraM())
                    .multiply(item.alturaM());
            return qtd.multiply(volUnitario).multiply(fatorMontagem);
        }

        // Se não tem dimensões, retorna zero
        return BigDecimal.ZERO;
    }

    private BigDecimal buscarFatorMontagem(StatusMontagem status) {
        if (status == null) return BigDecimal.ONE;

        LocalDate hoje = LocalDate.now();
        return fatorMontagemRepository.findAll().stream()
                .filter(fm -> fm.isAtivo()
                        && fm.getStatusMontagem() == status
                        && !fm.getVigenteDesde().isAfter(hoje)
                        && (fm.getVigenteAte() == null || !fm.getVigenteAte().isBefore(hoje)))
                .map(FatorMontagem::getFator)
                .findFirst()
                .orElse(BigDecimal.ONE);
    }

    private ParametroFrete buscarParametroVigente(TipoVeiculo tipoVeiculo) {
        if (tipoVeiculo == null) return null;

        LocalDate hoje = LocalDate.now();
        return parametroFreteRepository.findAll().stream()
                .filter(p -> p.isAtivo()
                        && p.getTipoVeiculo() == tipoVeiculo
                        && !p.getVigenteDesde().isAfter(hoje)
                        && (p.getVigenteAte() == null || !p.getVigenteAte().isBefore(hoje)))
                .findFirst()
                .orElse(null);
    }

    private BigDecimal nvl(BigDecimal val, BigDecimal defaultVal) {
        return val != null ? val : defaultVal;
    }
}
