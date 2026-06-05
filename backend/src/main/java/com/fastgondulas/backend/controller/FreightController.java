package com.fastgondulas.backend.controller;

import com.fastgondulas.backend.domain.dto.freight.FreightResultDTO;
import com.fastgondulas.backend.domain.dto.freight.VolumetricResultDTO;
import com.fastgondulas.backend.domain.dto.route.RouteResponseDTO;
import com.fastgondulas.backend.domain.dto.toll.TollResponseDTO;
import com.fastgondulas.backend.domain.logistica.StatusMontagem;
import com.fastgondulas.backend.domain.logistica.TipoVeiculo;
import com.fastgondulas.backend.service.freight.FreightCalculationService;
import com.fastgondulas.backend.service.freight.VolumetricCalculationService;
import com.fastgondulas.backend.service.route.RouteIntegrationService;
import com.fastgondulas.backend.service.toll.TollService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fastgondulas.backend.domain.dto.pdf.CargoItemDTO;
import java.util.List;

@RestController
@RequestMapping("/api/frete")
@RequiredArgsConstructor
public class FreightController {

    private final RouteIntegrationService routeIntegrationService;
    private final TollService tollService;
    private final VolumetricCalculationService volumetricService;
    private final FreightCalculationService freightService;

    public record SimularFreteRequest(
            @NotBlank String cidadeOrigem,
            @NotBlank String ufOrigem,
            @NotBlank String cidadeDestino,
            @NotBlank String ufDestino,
            @NotEmpty List<CargoItemDTO> itens,
            StatusMontagem statusMontagem,
            TipoVeiculo tipoVeiculo
    ) {}

    /**
     * POST /api/frete/calcular
     * Simula frete com dados fornecidos manualmente (sem PDF).
     */
    @PostMapping("/calcular")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FreightResultDTO> calcular(@RequestBody @Valid SimularFreteRequest req) {
        RouteResponseDTO rota = routeIntegrationService.calcularRota(
                req.cidadeOrigem(), req.ufOrigem(),
                req.cidadeDestino(), req.ufDestino()
        );

        TollResponseDTO pedagios = tollService.calcularPedagios(
                req.cidadeOrigem(), req.ufOrigem(),
                req.cidadeDestino(), req.ufDestino()
        );

        StatusMontagem statusMontagem = req.statusMontagem() != null
                ? req.statusMontagem() : StatusMontagem.MONTADOS;
        TipoVeiculo tipoVeiculo = req.tipoVeiculo() != null
                ? req.tipoVeiculo() : TipoVeiculo.CARRETA_NORMAL;

        VolumetricResultDTO volumetria = volumetricService.calcular(
                req.itens(), statusMontagem, tipoVeiculo
        );

        FreightResultDTO resultado = freightService.calcular(
                volumetria, rota, pedagios,
                req.ufOrigem(), req.ufDestino(), tipoVeiculo
        );

        return ResponseEntity.ok(resultado);
    }
}
