package com.fastgondulas.backend.integration.route;

import com.fastgondulas.backend.domain.dto.route.RouteResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class OpenRouteServiceClient {

    private final WebClient webClient;
    private final String apiKey;

    public OpenRouteServiceClient(
            WebClient.Builder builder,
            @Value("${app.integration.openrouteservice.api-key:}") String apiKey
    ) {
        this.apiKey = apiKey;
        this.webClient = builder
                .baseUrl("https://api.openrouteservice.org")
                .defaultHeader("Authorization", apiKey)
                .build();
    }

    public RouteResponseDTO calcularRota(double latOrigem, double lonOrigem,
                                         double latDestino, double lonDestino,
                                         String origemNome, String destinoNome) {
        try {
            Map<String, Object> body = Map.of(
                    "coordinates", List.of(
                            List.of(lonOrigem, latOrigem),
                            List.of(lonDestino, latDestino)
                    )
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = webClient.post()
                    .uri("/v2/directions/driving-hgv")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (response == null) {
                return fallback(origemNome, destinoNome);
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> routes = (List<Map<String, Object>>) response.get("routes");
            if (routes == null || routes.isEmpty()) {
                return fallback(origemNome, destinoNome);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> summary = (Map<String, Object>) routes.get(0).get("summary");
            double distanceMeters = toDouble(summary.get("distance"));
            double durationSeconds = toDouble(summary.get("duration"));

            BigDecimal distanciaKm = BigDecimal.valueOf(distanceMeters / 1000)
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal duracaoHoras = BigDecimal.valueOf(durationSeconds / 3600)
                    .setScale(2, RoundingMode.HALF_UP);

            return new RouteResponseDTO(origemNome, destinoNome, distanciaKm, duracaoHoras, "OpenRouteService");

        } catch (Exception e) {
            log.warn("OpenRouteService falhou: {}", e.getMessage());
            return fallback(origemNome, destinoNome);
        }
    }

    private RouteResponseDTO fallback(String origem, String destino) {
        log.warn("Retornando distância estimada (fallback) para {}->{}", origem, destino);
        return new RouteResponseDTO(origem, destino, BigDecimal.ZERO, BigDecimal.ZERO, "FALLBACK");
    }

    private double toDouble(Object val) {
        if (val instanceof Number n) return n.doubleValue();
        return 0.0;
    }
}
