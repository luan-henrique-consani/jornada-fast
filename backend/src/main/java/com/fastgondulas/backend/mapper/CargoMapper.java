package com.fastgondulas.backend.mapper;

import com.fastgondulas.backend.domain.dto.pdf.CargoItemDTO;
import com.fastgondulas.backend.domain.logistica.EstimativaItem;
import com.fastgondulas.backend.domain.logistica.MetodoVolumetria;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class CargoMapper {

    public EstimativaItem toEstimativaItem(CargoItemDTO dto, long estimativaId) {
        EstimativaItem item = new EstimativaItem();
        item.setEstimativaId(estimativaId);
        item.setDescricaoItem(dto.descricao());
        item.setQuantidade(dto.quantidade());

        boolean temDimensoes = dto.comprimentoM() != null
                && dto.larguraM() != null
                && dto.alturaM() != null;

        item.setMetodoVolumetria(temDimensoes
                ? MetodoVolumetria.DIMENSAO_FISICA
                : MetodoVolumetria.QTD_POR_M3);

        item.setComprimentoMUsado(dto.comprimentoM());
        item.setLarguraMUsado(dto.larguraM());
        item.setAlturaMUsado(dto.alturaM());
        item.setPesoBrutoKg(dto.pesoTotalKg());
        item.setCriadoEm(OffsetDateTime.now());
        item.setAtualizadoEm(OffsetDateTime.now());

        return item;
    }
}
