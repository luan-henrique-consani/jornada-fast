package com.fastgondulas.backend.service.pdf;

import com.fastgondulas.backend.domain.dto.pdf.CargoItemDTO;
import com.fastgondulas.backend.domain.dto.pdf.ExtractedPdfDataDTO;
import com.fastgondulas.backend.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class PdfExtractionService {

    private static final long MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "application/pdf", "application/x-pdf"
    );

    private static final DateTimeFormatter[] DATE_FORMATTERS = {
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd")
    };

    public ExtractedPdfDataDTO extrair(MultipartFile arquivo) {
        validarArquivo(arquivo);

        try {
            String texto = extrairTexto(arquivo);
            log.debug("Texto extraído do PDF ({} chars)", texto.length());
            return parseTexto(texto);
        } catch (IOException e) {
            throw new BusinessException("Falha ao processar o PDF: " + e.getMessage());
        }
    }

    private void validarArquivo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new BusinessException("Arquivo PDF não enviado");
        }
        if (arquivo.getSize() > MAX_SIZE_BYTES) {
            throw new BusinessException("Arquivo excede o tamanho máximo de 10 MB");
        }
        String contentType = arquivo.getContentType();
        String originalName = arquivo.getOriginalFilename();
        boolean validContentType = contentType != null && ALLOWED_CONTENT_TYPES.contains(contentType);
        boolean validExtension = originalName != null && originalName.toLowerCase().endsWith(".pdf");
        if (!validContentType && !validExtension) {
            throw new BusinessException("Apenas arquivos PDF são aceitos");
        }
    }

    private String extrairTexto(MultipartFile arquivo) throws IOException {
        try (PDDocument doc = Loader.loadPDF(arquivo.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(doc);
        }
    }

    private ExtractedPdfDataDTO parseTexto(String texto) {
        String numeroProposta = extrairPadraoUnico(texto,
                "(?i)(?:proposta|n[°º\\.\\s]*)\\s*[nN]?[°º\\.\\s]*([\\w\\-/]+)");
        String cliente = extrairPadraoUnico(texto,
                "(?i)(?:cliente|razão social|empresa)\\s*[:\\-]?\\s*([^\\n\\r]{3,80})");
        LocalDate dataDocumento = extrairData(texto);

        String[] origem = extrairLocalidade(texto, "(?i)(?:origem|saída|remetente)");
        String[] destino = extrairLocalidade(texto, "(?i)(?:destino|entrega|destinatário)");

        String observacoes = extrairPadraoUnico(texto,
                "(?i)(?:observa[çc][oõ]es|obs)\\s*[:\\-]?\\s*([^\\n\\r]{1,500})");

        List<CargoItemDTO> itens = extrairItens(texto);

        log.info("PDF extraído: proposta={}, cliente={}, origem={}/{}, destino={}/{}, itens={}",
                numeroProposta, cliente,
                origem[0], origem[1],
                destino[0], destino[1],
                itens.size());

        return new ExtractedPdfDataDTO(
                numeroProposta,
                cliente,
                dataDocumento,
                origem[0], origem[1], origem[2],
                destino[0], destino[1], destino[2],
                observacoes,
                itens
        );
    }

    private String extrairPadraoUnico(String texto, String regex) {
        Pattern p = Pattern.compile(regex);
        Matcher m = p.matcher(texto);
        return m.find() ? m.group(1).trim() : null;
    }

    private LocalDate extrairData(String texto) {
        Pattern p = Pattern.compile("(\\d{2}[/\\-]\\d{2}[/\\-]\\d{4}|\\d{4}[/\\-]\\d{2}[/\\-]\\d{2})");
        Matcher m = p.matcher(texto);
        if (m.find()) {
            String raw = m.group(1);
            for (DateTimeFormatter fmt : DATE_FORMATTERS) {
                try {
                    return LocalDate.parse(raw, fmt);
                } catch (DateTimeParseException ignored) {
                }
            }
        }
        return null;
    }

    private String[] extrairLocalidade(String texto, String labelRegex) {
        // [cidade, uf, cep]
        String[] result = {null, null, null};

        // Tenta: CIDADE - UF ou CIDADE/UF
        Pattern locPattern = Pattern.compile(
                labelRegex + "[\\s\\S]{0,100}?([A-ZÀ-Ú][\\w\\sÀ-Ú]{2,40})\\s*[-/]\\s*([A-Z]{2})",
                Pattern.CASE_INSENSITIVE
        );
        Matcher m = locPattern.matcher(texto);
        if (m.find()) {
            result[0] = m.group(1).trim();
            result[1] = m.group(2).trim();
        }

        // CEP
        Pattern cepPattern = Pattern.compile(
                labelRegex + "[\\s\\S]{0,200}?(\\d{5}-?\\d{3})",
                Pattern.CASE_INSENSITIVE
        );
        Matcher mc = cepPattern.matcher(texto);
        if (mc.find()) {
            result[2] = mc.group(1).trim();
        }

        return result;
    }

    private List<CargoItemDTO> extrairItens(String texto) {
        List<CargoItemDTO> itens = new ArrayList<>();

        /*
         * Tenta capturar linhas de tabela no formato:
         * CODIGO   DESCRICAO   QTD   PESO_UN   PESO_TOT   ALT   LARG   COMP
         * Ex: "SK001  Gondola 40cm  10  45,00  450,00  1,80  0,40  1,00"
         */
        Pattern linhaTabela = Pattern.compile(
                "([A-Z0-9]{2,30})\\s+([^\\d\\n]{5,80}?)\\s+" +
                "(\\d+(?:[.,]\\d+)?)\\s+" +
                "(\\d+(?:[.,]\\d+)?)\\s+" +
                "(\\d+(?:[.,]\\d+)?)\\s+" +
                "(\\d+(?:[.,]\\d+)?)\\s+" +
                "(\\d+(?:[.,]\\d+)?)\\s+" +
                "(\\d+(?:[.,]\\d+)?)"
        );

        Matcher m = linhaTabela.matcher(texto);
        while (m.find()) {
            try {
                itens.add(new CargoItemDTO(
                        m.group(1).trim(),
                        m.group(2).trim(),
                        parseBigDecimal(m.group(3)),
                        parseBigDecimal(m.group(4)),
                        parseBigDecimal(m.group(5)),
                        parseBigDecimal(m.group(6)),
                        parseBigDecimal(m.group(7)),
                        parseBigDecimal(m.group(8))
                ));
            } catch (Exception e) {
                log.warn("Erro ao parsear item do PDF: {}", e.getMessage());
            }
        }

        // Fallback: tenta extrair linhas com ao menos código + descrição + quantidade
        if (itens.isEmpty()) {
            itens = extrairItensFallback(texto);
        }

        return itens;
    }

    private List<CargoItemDTO> extrairItensFallback(String texto) {
        List<CargoItemDTO> itens = new ArrayList<>();
        Pattern p = Pattern.compile(
                "([A-Z0-9\\-]{2,30})\\s{2,}([^\\n\\r\\d]{5,80})\\s{1,}(\\d+(?:[.,]\\d+)?)"
        );
        Matcher m = p.matcher(texto);
        while (m.find()) {
            itens.add(new CargoItemDTO(
                    m.group(1).trim(),
                    m.group(2).trim(),
                    parseBigDecimal(m.group(3)),
                    null, null, null, null, null
            ));
        }
        return itens;
    }

    private BigDecimal parseBigDecimal(String valor) {
        if (valor == null || valor.isBlank()) return null;
        return new BigDecimal(valor.replace(",", "."));
    }
}
