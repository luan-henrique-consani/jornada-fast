package com.fastgondulas.backend.service.toll;

import com.fastgondulas.backend.domain.dto.toll.TollResponseDTO;
import com.fastgondulas.backend.integration.toll.TollGuruClient;
import com.fastgondulas.backend.service.route.RouteIntegrationService;
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
public class TollService {

    private final TollGuruClient tollGuruClient;
    private final WebClient.Builder webClientBuilder;

    public TollResponseDTO calcularPedagios(String cidadeOrigem, String ufOrigem,
                                             String cidadeDestino, String ufDestino) {
        double[] coordOrigem = geocodificar(cidadeOrigem, ufOrigem);
        double[] coordDestino = geocodificar(cidadeDestino, ufDestino);

        if (coordOrigem == null || coordDestino == null) {
            log.warn("Não foi possível geocodificar para cálculo de pedágios");
            return new TollResponseDTO(0, BigDecimal.ZERO, "INDISPONIVEL");
        }

        return tollGuruClient.calcularPedagios(
                coordOrigem[0], coordOrigem[1],
                coordDestino[0], coordDestino[1]
        );
    }

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
                    .header("User-Agent", "FastGondulas/1.0")
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
