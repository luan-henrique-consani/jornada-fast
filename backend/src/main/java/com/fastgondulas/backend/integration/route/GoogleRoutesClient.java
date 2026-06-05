package com.fastgondulas.backend.integration.route;

import com.fastgondulas.backend.domain.dto.route.RouteResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
public class GoogleRoutesClient {

    private final WebClient webClient;
    private final String apiKey;

    public GoogleRoutesClient(
            WebClient.Builder builder,
            @Value("${app.integration.google-routes.api-key:}") String apiKey
    ) {
        this.apiKey = apiKey;
        this.webClient = builder
                .baseUrl("https://routes.googleapis.com")
                .build();
    }

    public RouteResponseDTO calcularRota(String origem, String destino) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Google Routes API Key não configurada");
            return null;
        }

        try {
            Map<String, Object> body = Map.of(
                    "origin", Map.of("address", origem + ", Brasil"),
                    "destination", Map.of("address", destino + ", Brasil"),
                    "travelMode", "DRIVE",
                    "routingPreference", "TRAFFIC_UNAWARE",
                    "units", "METRIC"
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/directions/v2:computeRoutes")
                            .queryParam("key", apiKey)
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("X-Goog-FieldMask",
                            "routes.duration,routes.distanceMeters,routes.legs")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (response == null) return null;

            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> routes =
                    (java.util.List<Map<String, Object>>) response.get("routes");

            if (routes == null || routes.isEmpty()) return null;

            Map<String, Object> route = routes.get(0);
            int distanceMeters = toInt(route.get("distanceMeters"));
            String durationStr = String.valueOf(route.get("duration"));
            // duration vem como "3600s"
            long durationSecs = parseDurationSeconds(durationStr);

            BigDecimal distanciaKm = BigDecimal.valueOf(distanceMeters / 1000.0)
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal duracaoHoras = BigDecimal.valueOf(durationSecs / 3600.0)
                    .setScale(2, RoundingMode.HALF_UP);

            return new RouteResponseDTO(origem, destino, distanciaKm, duracaoHoras, "GoogleRoutes");

        } catch (Exception e) {
            log.warn("Google Routes falhou: {}", e.getMessage());
            return null;
        }
    }

    private int toInt(Object val) {
        if (val instanceof Number n) return n.intValue();
        return 0;
    }

    private long parseDurationSeconds(String duration) {
        if (duration == null) return 0;
        String numeric = duration.replace("s", "").trim();
        try {
            return Long.parseLong(numeric);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
