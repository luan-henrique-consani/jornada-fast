package com.fastgondulas.backend.domain.dto.pdf;

import java.math.BigDecimal;

public record CargoItemDTO(
        String codigo,
        String descricao,
        BigDecimal quantidade,
        BigDecimal pesoUnitarioKg,
        BigDecimal pesoTotalKg,
        BigDecimal alturaM,
        BigDecimal larguraM,
        BigDecimal comprimentoM
) {}
