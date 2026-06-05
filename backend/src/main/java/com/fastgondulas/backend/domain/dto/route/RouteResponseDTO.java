package com.fastgondulas.backend.domain.dto.route;

import java.math.BigDecimal;

public record RouteResponseDTO(
        String origem,
        String destino,
        BigDecimal distanciaKm,
        BigDecimal duracaoHoras,
        String provider
) {}
