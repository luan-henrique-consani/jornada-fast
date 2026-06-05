package com.fastgondulas.backend.domain.dto.pdf;

import java.time.LocalDate;
import java.util.List;

public record ExtractedPdfDataDTO(
        String numeroProposta,
        String cliente,
        LocalDate dataDocumento,
        String cidadeOrigem,
        String estadoOrigem,
        String cepOrigem,
        String cidadeDestino,
        String estadoDestino,
        String cepDestino,
        String observacoes,
        List<CargoItemDTO> itens
) {}
