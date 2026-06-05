package com.fastgondulas.backend.domain.dto.freight;

import com.fastgondulas.backend.domain.dto.route.RouteResponseDTO;
import com.fastgondulas.backend.domain.dto.toll.TollResponseDTO;

import java.math.BigDecimal;

public record FreightResultDTO(
        RouteResponseDTO rota,
        TollResponseDTO pedagios,
        VolumetricResultDTO volumetria,
        BigDecimal valorFreteBase,
        BigDecimal valorFreteNvia,
        BigDecimal valorFreteVenda,
        String tipoVeiculo
) {}
