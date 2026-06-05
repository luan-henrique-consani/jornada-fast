package com.fastgondulas.backend.domain.dto.cotacao;

import com.fastgondulas.backend.domain.dto.freight.FreightResultDTO;
import com.fastgondulas.backend.domain.dto.pdf.ExtractedPdfDataDTO;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CotacaoResponseDTO(
        Long estimativaId,
        UUID publicId,
        String cliente,
        String origem,
        String destino,
        ExtractedPdfDataDTO dadosExtraidos,
        FreightResultDTO frete,
        OffsetDateTime criadoEm
) {}
