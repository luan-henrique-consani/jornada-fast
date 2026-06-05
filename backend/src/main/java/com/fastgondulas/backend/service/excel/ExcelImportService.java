package com.fastgondulas.backend.service.excel;

import com.fastgondulas.backend.domain.catalogo.Produto;
import com.fastgondulas.backend.domain.catalogo.ProdutoCategoria;
import com.fastgondulas.backend.domain.catalogo.TipoLinha;
import com.fastgondulas.backend.domain.logistica.MetodoVolumetria;
import com.fastgondulas.backend.exception.BusinessException;
import com.fastgondulas.backend.repository.ProdutoCategoriaRepository;
import com.fastgondulas.backend.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Importa dados de planilhas Excel para o banco.
 *
 * Excel 07 (SK e RFG) → linha seca (QTD_POR_M3)
 * Excel 08 (Linha Seca) → estimativas e parâmetros linha seca
 *
 * Colunas esperadas na aba de produtos:
 *  A: Código, B: Descrição, C: Categoria, D: QTD por M³
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelImportService {

    private final ProdutoRepository produtoRepository;
    private final ProdutoCategoriaRepository produtoCategoriaRepository;

    public record ImportacaoResultado(int processados, int criados, int atualizados, List<String> erros) {}

    @Transactional
    public ImportacaoResultado importarProdutosLinhaSeca(MultipartFile arquivo) {
        validarArquivo(arquivo);

        List<String> erros = new ArrayList<>();
        int criados = 0, atualizados = 0, processados = 0;

        try (Workbook workbook = new XSSFWorkbook(arquivo.getInputStream())) {
            Sheet sheet = encontrarAbaProdutos(workbook);
            if (sheet == null) {
                throw new BusinessException("Aba de produtos não encontrada na planilha");
            }

            for (int rowIdx = 1; rowIdx <= sheet.getLastRowNum(); rowIdx++) {
                Row row = sheet.getRow(rowIdx);
                if (row == null || isLinhaVazia(row)) continue;

                try {
                    String codigo = getCellString(row, 0);
                    String descricao = getCellString(row, 1);
                    String categoriaNome = getCellString(row, 2);
                    BigDecimal qtdPorM3 = getCellBigDecimal(row, 3);

                    if (codigo == null || codigo.isBlank()) continue;

                    processados++;
                    ProdutoCategoria categoria = buscarOuCriarCategoria(categoriaNome);

                    var existente = produtoRepository.findAll().stream()
                            .filter(p -> codigo.equals(p.getCodigo()))
                            .findFirst();

                    if (existente.isPresent()) {
                        Produto p = existente.get();
                        p.setDescricao(descricao != null ? descricao : p.getDescricao());
                        p.setQtdPorM3(qtdPorM3);
                        p.setAtualizadoEm(OffsetDateTime.now());
                        produtoRepository.save(p);
                        atualizados++;
                    } else {
                        Produto novo = new Produto();
                        novo.setPublicId(UUID.randomUUID());
                        novo.setCodigo(codigo);
                        novo.setDescricao(descricao != null ? descricao : codigo);
                        novo.setCategoriaId(categoria.getId());
                        novo.setLinha(TipoLinha.SECA);
                        novo.setMetodoVolumetria(MetodoVolumetria.QTD_POR_M3);
                        novo.setQtdPorM3(qtdPorM3);
                        novo.setAtivo(true);
                        novo.setCriadoEm(OffsetDateTime.now());
                        novo.setAtualizadoEm(OffsetDateTime.now());
                        novo.setCriadoPor("EXCEL_IMPORT");
                        produtoRepository.save(novo);
                        criados++;
                    }
                } catch (Exception e) {
                    erros.add("Linha " + (rowIdx + 1) + ": " + e.getMessage());
                    log.warn("Erro na linha {}: {}", rowIdx + 1, e.getMessage());
                }
            }
        } catch (IOException e) {
            throw new BusinessException("Falha ao ler planilha: " + e.getMessage());
        }

        log.info("Importação Excel concluída: processados={}, criados={}, atualizados={}, erros={}",
                processados, criados, atualizados, erros.size());

        return new ImportacaoResultado(processados, criados, atualizados, erros);
    }

    private Sheet encontrarAbaProdutos(Workbook workbook) {
        String[] nomesAbas = {"Produtos", "PRODUTOS", "Itens", "ITENS", "SK", "RFG", "Dados"};
        for (String nome : nomesAbas) {
            Sheet sheet = workbook.getSheet(nome);
            if (sheet != null) return sheet;
        }
        // Retorna primeira aba disponível
        return workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
    }

    private ProdutoCategoria buscarOuCriarCategoria(String nome) {
        if (nome == null || nome.isBlank()) nome = "OUTROS";

        String finalNome = nome.trim().toUpperCase();
        return produtoCategoriaRepository.findAll().stream()
                .filter(c -> c.getCodigo().equalsIgnoreCase(finalNome)
                        || c.getNome().equalsIgnoreCase(finalNome))
                .findFirst()
                .orElseGet(() -> {
                    ProdutoCategoria nova = new ProdutoCategoria();
                    nova.setNome(finalNome);
                    nova.setCodigo(finalNome.replaceAll("\\s+", "_"));
                    nova.setLinha(TipoLinha.SECA);
                    nova.setAtivo(true);
                    nova.setCriadoEm(OffsetDateTime.now());
                    return produtoCategoriaRepository.save(nova);
                });
    }

    private String getCellString(Row row, int colIdx) {
        Cell cell = row.getCell(colIdx);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }

    private BigDecimal getCellBigDecimal(Row row, int colIdx) {
        Cell cell = row.getCell(colIdx);
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return BigDecimal.valueOf(cell.getNumericCellValue());
            }
            if (cell.getCellType() == CellType.STRING) {
                String val = cell.getStringCellValue().replace(",", ".").trim();
                return val.isBlank() ? null : new BigDecimal(val);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private boolean isLinhaVazia(Row row) {
        for (int i = 0; i < 4; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    private void validarArquivo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new BusinessException("Arquivo Excel não enviado");
        }
        String name = arquivo.getOriginalFilename();
        if (name == null || (!name.endsWith(".xlsx") && !name.endsWith(".xls"))) {
            throw new BusinessException("Apenas arquivos .xlsx e .xls são aceitos");
        }
    }
}
