package com.fastgondulas.backend.controller;

import com.fastgondulas.backend.service.excel.ExcelImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final ExcelImportService excelImportService;

    /**
     * POST /api/admin/excel/importar-produtos
     * Importa produtos de planilha Excel (ADMIN apenas).
     */
    @PostMapping(value = "/importar-produtos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExcelImportService.ImportacaoResultado> importarProdutos(
            @RequestParam("arquivo") MultipartFile arquivo
    ) {
        return ResponseEntity.ok(excelImportService.importarProdutosLinhaSeca(arquivo));
    }
}
