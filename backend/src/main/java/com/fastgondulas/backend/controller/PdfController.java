package com.fastgondulas.backend.controller;

import com.fastgondulas.backend.domain.dto.cotacao.CotacaoResponseDTO;
import com.fastgondulas.backend.service.cotacao.CotacaoService;
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
@RequestMapping("/api/cotacoes")
@RequiredArgsConstructor
public class PdfController {

    private final CotacaoService cotacaoService;

    /**
     * POST /api/cotacoes/upload
     * Recebe PDF, extrai dados, calcula rota/pedágio/volumetria/frete e retorna cotação completa.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CotacaoResponseDTO> upload(
            @RequestParam("arquivo") MultipartFile arquivo
    ) {
        CotacaoResponseDTO cotacao = cotacaoService.processarPdf(arquivo);
        return ResponseEntity.ok(cotacao);
    }
}
