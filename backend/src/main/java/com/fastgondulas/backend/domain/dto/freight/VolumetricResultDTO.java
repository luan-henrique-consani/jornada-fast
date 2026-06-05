package com.fastgondulas.backend.domain.dto.freight;

import java.math.BigDecimal;

public record VolumetricResultDTO(
        BigDecimal volumeTotalM3,
        BigDecimal pesoTotalKg,
        BigDecimal metrosCaminhao,
        BigDecimal metrosCaminhaoNvia,
        BigDecimal metrosCaminhaoVenda,
        int totalVolumes
) {}
