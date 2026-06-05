package com.fastgondulas.backend.service.cotacao;

import com.fastgondulas.backend.domain.core.Cliente;
import com.fastgondulas.backend.domain.documental.DocumentoImportado;
import com.fastgondulas.backend.domain.documental.StatusProcessamento;
import com.fastgondulas.backend.domain.documental.TipoDocumento;
import com.fastgondulas.backend.domain.dto.cotacao.CotacaoResponseDTO;
import com.fastgondulas.backend.domain.dto.freight.FreightResultDTO;
import com.fastgondulas.backend.domain.dto.freight.VolumetricResultDTO;
import com.fastgondulas.backend.domain.dto.pdf.ExtractedPdfDataDTO;
import com.fastgondulas.backend.domain.dto.route.RouteResponseDTO;
import com.fastgondulas.backend.domain.dto.toll.TollResponseDTO;
import com.fastgondulas.backend.domain.logistica.Estimativa;
import com.fastgondulas.backend.domain.logistica.StatusMontagem;
import com.fastgondulas.backend.domain.logistica.TipoVeiculo;
import com.fastgondulas.backend.repository.ClienteRepository;
import com.fastgondulas.backend.repository.DocumentoImportadoRepository;
import com.fastgondulas.backend.repository.EstimativaRepository;
import com.fastgondulas.backend.service.freight.FreightCalculationService;
import com.fastgondulas.backend.service.freight.VolumetricCalculationService;
import com.fastgondulas.backend.service.pdf.PdfExtractionService;
import com.fastgondulas.backend.service.route.RouteIntegrationService;
import com.fastgondulas.backend.service.toll.TollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CotacaoService {

    private final PdfExtractionService pdfExtractionService;
    private final RouteIntegrationService routeIntegrationService;
    private final TollService tollService;
    private final VolumetricCalculationService volumetricService;
    private final FreightCalculationService freightService;
    private final DocumentoImportadoRepository documentoRepository;
    private final EstimativaRepository estimativaRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public CotacaoResponseDTO processarPdf(MultipartFile arquivo) {
        String usuarioAtual = obterUsuarioAtual();
        log.info("Iniciando processamento PDF: {} por {}", arquivo.getOriginalFilename(), usuarioAtual);

        // 1. Extrai dados do PDF
        ExtractedPdfDataDTO dados = pdfExtractionService.extrair(arquivo);

        // 2. Registra documento no banco
        DocumentoImportado documento = registrarDocumento(arquivo, dados, usuarioAtual);

        // 3. Calcula rota
        RouteResponseDTO rota = calcularRota(dados);

        // 4. Calcula pedágios
        TollResponseDTO pedagios = calcularPedagios(dados);

        // 5. Calcula volumetria
        VolumetricResultDTO volumetria = volumetricService.calcular(
                dados.itens(),
                StatusMontagem.MONTADOS,
                TipoVeiculo.CARRETA_NORMAL
        );

        // 6. Calcula frete
        FreightResultDTO frete = freightService.calcular(
                volumetria,
                rota,
                pedagios,
                dados.estadoOrigem(),
                dados.estadoDestino(),
                TipoVeiculo.CARRETA_NORMAL
        );

        // 7. Persiste estimativa
        long clienteId = resolverClienteId(dados.cliente(), usuarioAtual);
        Estimativa estimativa = persistirEstimativa(dados, volumetria, usuarioAtual, documento.getId(), clienteId);

        // 8. Atualiza documento como processado
        documento.setStatus(StatusProcessamento.PROCESSADO);
        documento.setAtualizadoEm(OffsetDateTime.now());
        documentoRepository.save(documento);

        log.info("Cotação concluída: estimativa={}, distância={}km, freteVenda=R${}",
                estimativa.getId(), rota.distanciaKm(), frete.valorFreteVenda());

        String origemStr = formatarLocalidade(dados.cidadeOrigem(), dados.estadoOrigem());
        String destinoStr = formatarLocalidade(dados.cidadeDestino(), dados.estadoDestino());

        return new CotacaoResponseDTO(
                estimativa.getId(),
                estimativa.getPublicId(),
                dados.cliente(),
                origemStr,
                destinoStr,
                dados,
                frete,
                estimativa.getCriadoEm()
        );
    }

    private RouteResponseDTO calcularRota(ExtractedPdfDataDTO dados) {
        if (dados.cidadeOrigem() == null || dados.cidadeDestino() == null) {
            log.warn("Origem ou destino não identificado no PDF");
            return new RouteResponseDTO(
                    formatarLocalidade(dados.cidadeOrigem(), dados.estadoOrigem()),
                    formatarLocalidade(dados.cidadeDestino(), dados.estadoDestino()),
                    BigDecimal.ZERO, BigDecimal.ZERO, "NAO_DISPONIVEL"
            );
        }
        return routeIntegrationService.calcularRota(
                dados.cidadeOrigem(), dados.estadoOrigem(),
                dados.cidadeDestino(), dados.estadoDestino()
        );
    }

    private TollResponseDTO calcularPedagios(ExtractedPdfDataDTO dados) {
        if (dados.cidadeOrigem() == null || dados.cidadeDestino() == null) {
            return new TollResponseDTO(0, BigDecimal.ZERO, "NAO_DISPONIVEL");
        }
        return tollService.calcularPedagios(
                dados.cidadeOrigem(), dados.estadoOrigem(),
                dados.cidadeDestino(), dados.estadoDestino()
        );
    }

    private DocumentoImportado registrarDocumento(MultipartFile arquivo,
                                                   ExtractedPdfDataDTO dados,
                                                   String usuario) {
        String hash = calcularHash(arquivo);

        DocumentoImportado doc = new DocumentoImportado();
        doc.setPublicId(UUID.randomUUID());
        doc.setNomeArquivo(arquivo.getOriginalFilename());
        doc.setTipoDocumento(TipoDocumento.PDF);
        doc.setMimeType(arquivo.getContentType());
        doc.setExtensao("pdf");
        doc.setTamanhoBytes(arquivo.getSize());
        doc.setHashSha256(hash);
        doc.setStatus(StatusProcessamento.PROCESSANDO);
        doc.setImportadoEm(OffsetDateTime.now());
        doc.setImportadoPor(usuario);
        doc.setAtualizadoEm(OffsetDateTime.now());

        return documentoRepository.save(doc);
    }

    private long resolverClienteId(String nomeCliente, String usuario) {
        String nome = (nomeCliente != null && !nomeCliente.isBlank()) ? nomeCliente : "CLIENTE_PDF";
        return clienteRepository.findByNomeIgnoreCase(nome)
                .map(Cliente::getId)
                .orElseGet(() -> {
                    Cliente novo = new Cliente();
                    novo.setPublicId(UUID.randomUUID());
                    novo.setNome(nome);
                    novo.setAtivo(true);
                    novo.setCriadoEm(java.time.LocalDateTime.now());
                    novo.setAtualizadoEm(java.time.LocalDateTime.now());
                    novo.setCriadoPor(usuario);
                    return clienteRepository.save(novo).getId();
                });
    }

    private Estimativa persistirEstimativa(ExtractedPdfDataDTO dados,
                                            VolumetricResultDTO vol,
                                            String usuario,
                                            long documentoId,
                                            long clienteId) {
        String descricao = "PDF: " + (dados.numeroProposta() != null
                ? dados.numeroProposta()
                : dados.cliente() != null ? dados.cliente() : "SEM_DESCRICAO");

        Estimativa e = new Estimativa();
        e.setPublicId(UUID.randomUUID());
        e.setClienteId(clienteId);
        e.setDescricao(descricao);
        e.setStatusMontagem(StatusMontagem.MONTADOS);
        e.setVolumeTotalM3(vol.volumeTotalM3());
        e.setPesoTotalKg(vol.pesoTotalKg());
        e.setMtsCaminhao(vol.metrosCaminhao());
        e.setMtsCaminhaoNvia(vol.metrosCaminhaoNvia());
        e.setMtsCaminhaoVenda(vol.metrosCaminhaoVenda());
        e.setCalculadoEm(OffsetDateTime.now());
        e.setCalculadoPor(usuario);
        e.setAtivo(true);
        e.setCriadoEm(OffsetDateTime.now());
        e.setAtualizadoEm(OffsetDateTime.now());
        e.setCriadoPor(usuario);

        return estimativaRepository.save(e);
    }

    private String calcularHash(MultipartFile arquivo) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(arquivo.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }

    private String formatarLocalidade(String cidade, String uf) {
        if (cidade == null && uf == null) return "Não identificado";
        if (cidade == null) return uf;
        if (uf == null) return cidade;
        return cidade + " - " + uf;
    }

    private String obterUsuarioAtual() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "SISTEMA";
        }
    }
}
