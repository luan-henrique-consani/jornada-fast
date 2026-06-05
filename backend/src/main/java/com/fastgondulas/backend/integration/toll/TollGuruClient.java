package com.fastgondulas.backend.integration.toll;

import com.fastgondulas.backend.domain.dto.toll.TollResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class TollGuruClient {

    private final WebClient webClient;
    private final String apiKey;

    public TollGuruClient(
            WebClient.Builder builder,
            @Value("${app.integration.tollguru.api-key:}") String apiKey
    ) {
        this.apiKey = apiKey;
        this.webClient = builder
                .baseUrl("https://apis.tollguru.com")
                .build();
    }

    public TollResponseDTO calcularPedagios(double latOrigem, double lonOrigem,
                                             double latDestino, double lonDestino) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("TollGuru API Key não configurada");
            return fallback();
        }

        try {
            Map<String, Object> body = Map.of(
                    "from", Map.of(
                            "address", latOrigem + "," + lonOrigem
                    ),
                    "to", Map.of(
                            "address", latDestino + "," + lonDestino
                    ),
                    "vehicleType", "5AxlesTruck",
                    "currency", "BRL"
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/toll/v2/complete-travel-cost-between-waypoints")
                            .queryParam("key", apiKey)
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (response == null) return fallback();

            return parseTollResponse(response);

        } catch (Exception e) {
            log.warn("TollGuru falhou: {}", e.getMessage());
            return fallback();
        }
    }

    @SuppressWarnings("unchecked")
    private TollResponseDTO parseTollResponse(Map<String, Object> response) {
        try {
            Map<String, Object> route = (Map<String, Object>) response.get("route");
            if (route == null) return fallback();

            List<Map<String, Object>> tolls = (List<Map<String, Object>>) route.get("tolls");
            int quantidade = tolls != null ? tolls.size() : 0;

            Map<String, Object> costs = (Map<String, Object>) route.get("costs");
            double total = 0.0;
            if (costs != null) {
                Object tagCost = costs.get("tag");
                if (tagCost instanceof Number n) total = n.doubleValue();
            }

            return new TollResponseDTO(quantidade, BigDecimal.valueOf(total), "TollGuru");
        } catch (Exception e) {
            log.warn("Erro ao parsear resposta TollGuru: {}", e.getMessage());
            return fallback();
        }
    }

    private TollResponseDTO fallback() {
        return new TollResponseDTO(0, BigDecimal.ZERO, "INDISPONIVEL");
    }
}
