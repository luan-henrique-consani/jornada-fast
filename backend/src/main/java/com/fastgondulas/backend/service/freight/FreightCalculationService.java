package com.fastgondulas.backend.service.freight;

import com.fastgondulas.backend.domain.dto.freight.FreightResultDTO;
import com.fastgondulas.backend.domain.dto.freight.VolumetricResultDTO;
import com.fastgondulas.backend.domain.dto.route.RouteResponseDTO;
import com.fastgondulas.backend.domain.dto.toll.TollResponseDTO;
import com.fastgondulas.backend.domain.logistica.FaixaFrete;
import com.fastgondulas.backend.domain.logistica.TabelaFrete;
import com.fastgondulas.backend.domain.logistica.TipoVeiculo;
import com.fastgondulas.backend.repository.FaixaFreteRepository;
import com.fastgondulas.backend.repository.TabelaFreteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Cálculo de frete com base nas tabelas existentes no banco.
 *
 * Fórmula:
 *   valorBase = max(mts * custoporMetro, custoMinimo)
 *   valorNvia = baseado em mtsNvia
 *   valorVenda = baseado em mtsVenda
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FreightCalculationService {

    private final TabelaFreteRepository tabelaFreteRepository;
    private final FaixaFreteRepository faixaFreteRepository;

    public FreightResultDTO calcular(VolumetricResultDTO volumetria,
                                     RouteResponseDTO rota,
                                     TollResponseDTO pedagios,
                                     String ufOrigem,
                                     String ufDestino,
                                     TipoVeiculo tipoVeiculo) {
        Optional<TabelaFrete> tabelaOpt = buscarTabela(tipoVeiculo, ufOrigem, ufDestino);

        BigDecimal valorBase = BigDecimal.ZERO;
        BigDecimal valorNvia = BigDecimal.ZERO;
        BigDecimal valorVenda = BigDecimal.ZERO;

        if (tabelaOpt.isPresent()) {
            TabelaFrete tabela = tabelaOpt.get();
            List<FaixaFrete> faixas = faixaFreteRepository.findAll().stream()
                    .filter(f -> f.getTabelaId() != null && f.getTabelaId().equals(tabela.getId()))
                    .sorted(Comparator.comparing(FaixaFrete::getMetrosMin))
                    .toList();

            valorBase = calcularValorPorMetros(faixas, volumetria.metrosCaminhao());
            valorNvia = calcularValorPorMetros(faixas, volumetria.metrosCaminhaoNvia());
            valorVenda = calcularValorPorMetros(faixas, volumetria.metrosCaminhaoVenda());
        } else {
            log.warn("Tabela de frete não encontrada para tipoVeiculo={}, uf={}/{}", tipoVeiculo, ufOrigem, ufDestino);
        }

        // Acrescenta pedágios ao custo base
        BigDecimal pedagioTotal = pedagios != null ? pedagios.valorTotalReais() : BigDecimal.ZERO;
        valorBase = valorBase.add(pedagioTotal);
        valorNvia = valorNvia.add(pedagioTotal);
        valorVenda = valorVenda.add(pedagioTotal);

        log.info("Frete calculado: base=R${}, nvia=R${}, venda=R${}", valorBase, valorNvia, valorVenda);

        return new FreightResultDTO(
                rota,
                pedagios,
                volumetria,
                valorBase.setScale(2, RoundingMode.HALF_UP),
                valorNvia.setScale(2, RoundingMode.HALF_UP),
                valorVenda.setScale(2, RoundingMode.HALF_UP),
                tipoVeiculo != null ? tipoVeiculo.name() : null
        );
    }

    private Optional<TabelaFrete> buscarTabela(TipoVeiculo tipoVeiculo,
                                                String ufOrigem, String ufDestino) {
        LocalDate hoje = LocalDate.now();
        return tabelaFreteRepository.findAll().stream()
                .filter(t -> t.isAtivo()
                        && (tipoVeiculo == null || t.getTipoVeiculo() == tipoVeiculo)
                        && (t.getUfOrigem() == null || t.getUfOrigem().equalsIgnoreCase(ufOrigem))
                        && (t.getUfDestino() == null || t.getUfDestino().equalsIgnoreCase(ufDestino))
                        && !t.getVigenteDesde().isAfter(hoje)
                        && (t.getVigenteAte() == null || !t.getVigenteAte().isBefore(hoje)))
                .findFirst();
    }

    private BigDecimal calcularValorPorMetros(List<FaixaFrete> faixas, BigDecimal metros) {
        if (metros == null || metros.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;

        for (FaixaFrete faixa : faixas) {
            boolean dentroMin = metros.compareTo(faixa.getMetrosMin()) >= 0;
            boolean dentroMax = faixa.getMetrosMax() == null
                    || metros.compareTo(faixa.getMetrosMax()) <= 0;

            if (dentroMin && dentroMax) {
                BigDecimal valor = metros.multiply(faixa.getCustoPorMetro());
                BigDecimal minimo = faixa.getCustoMinimo() != null ? faixa.getCustoMinimo() : BigDecimal.ZERO;
                return valor.max(minimo);
            }
        }

        // Usa última faixa se metros excede todas
        if (!faixas.isEmpty()) {
            FaixaFrete ultima = faixas.get(faixas.size() - 1);
            BigDecimal valor = metros.multiply(ultima.getCustoPorMetro());
            BigDecimal minimo = ultima.getCustoMinimo() != null ? ultima.getCustoMinimo() : BigDecimal.ZERO;
            return valor.max(minimo);
        }

        return BigDecimal.ZERO;
    }
}
