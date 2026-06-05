package com.fastgondulas.backend.domain.dto.toll;

import java.math.BigDecimal;

public record TollResponseDTO(
        int quantidadePedagios,
        BigDecimal valorTotalReais,
        String provider
) {}
