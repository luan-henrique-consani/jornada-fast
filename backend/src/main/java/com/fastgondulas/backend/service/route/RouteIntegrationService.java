package com.fastgondulas.backend.service.route;

import com.fastgondulas.backend.domain.dto.route.RouteResponseDTO;
import com.fastgondulas.backend.integration.route.GoogleRoutesClient;
import com.fastgondulas.backend.integration.route.OpenRouteServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RouteIntegrationService {

    private final GoogleRoutesClient googleRoutesClient;
    private final OpenRouteServiceClient openRouteServiceClient;
    private final WebClient.Builder webClientBuilder;

    /**
     * Calcula rota entre origem e destino.
     * Prioridade: Google Routes → OpenRouteService → Nominatim + ORS
     */
    public RouteResponseDTO calcularRota(String cidadeOrigem, String ufOrigem,
                                          String cidadeDestino, String ufDestino) {
        String origemStr = cidadeOrigem + " - " + ufOrigem;
        String destinoStr = cidadeDestino + " - " + ufDestino;

        // Tentativa 1: Google Routes (se key configurada)
        RouteResponseDTO google = googleRoutesClient.calcularRota(origemStr, destinoStr);
        if (google != null && google.distanciaKm().compareTo(BigDecimal.ZERO) > 0) {
            log.info("Rota obtida via Google Routes: {}km", google.distanciaKm());
            return google;
        }

        // Tentativa 2: Nominatim + OpenRouteService
        double[] coordOrigem = geocodificar(cidadeOrigem, ufOrigem);
        double[] coordDestino = geocodificar(cidadeDestino, ufDestino);

        if (coordOrigem != null && coordDestino != null) {
            RouteResponseDTO ors = openRouteServiceClient.calcularRota(
                    coordOrigem[0], coordOrigem[1],
                    coordDestino[0], coordDestino[1],
                    origemStr, destinoStr
            );
            if (ors != null && ors.distanciaKm().compareTo(BigDecimal.ZERO) > 0) {
                log.info("Rota obtida via OpenRouteService: {}km", ors.distanciaKm());
                return ors;
            }
        }

        log.warn("Não foi possível calcular rota para {}->{}", origemStr, destinoStr);
        return new RouteResponseDTO(origemStr, destinoStr, BigDecimal.ZERO, BigDecimal.ZERO, "INDISPONIVEL");
    }

    /**
     * Geocodifica cidade/UF usando Nominatim (OpenStreetMap).
     */
    private double[] geocodificar(String cidade, String uf) {
        try {
            WebClient client = webClientBuilder.baseUrl("https://nominatim.openstreetmap.org").build();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("city", cidade)
                            .queryParam("state", uf)
                            .queryParam("country", "Brazil")
                            .queryParam("format", "json")
                            .queryParam("limit", "1")
                            .build())
                    .header("User-Agent", "FastGondulas/1.0 (suporte@fastgondulas.com.br)")
                    .retrieve()
                    .bodyToMono(List.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (results != null && !results.isEmpty()) {
                Map<String, Object> first = results.get(0);
                double lat = Double.parseDouble(String.valueOf(first.get("lat")));
                double lon = Double.parseDouble(String.valueOf(first.get("lon")));
                return new double[]{lat, lon};
            }
        } catch (Exception e) {
            log.warn("Geocodificação falhou para {}/{}: {}", cidade, uf, e.getMessage());
        }
        return null;
    }
}
