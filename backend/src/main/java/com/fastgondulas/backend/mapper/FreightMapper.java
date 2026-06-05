package com.fastgondulas.backend.mapper;

import com.fastgondulas.backend.domain.dto.freight.FreightResultDTO;
import com.fastgondulas.backend.domain.logistica.CustoLogistico;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class FreightMapper {

    public List<CustoLogistico> toCustosLogisticos(FreightResultDTO dto, long simulacaoId) {
        List<CustoLogistico> custos = new ArrayList<>();

        if (dto.rota() != null && dto.valorFreteBase() != null) {
            CustoLogistico frete = new CustoLogistico();
            frete.setSimulacaoId(simulacaoId);
            frete.setDescricao("Frete base (" + dto.rota().provider() + ")");
            frete.setValor(dto.valorFreteBase());
            frete.setTipo("FRETE_BASE");
            frete.setCriadoEm(OffsetDateTime.now());
            custos.add(frete);
        }

        if (dto.pedagios() != null && dto.pedagios().valorTotalReais() != null) {
            CustoLogistico pedagio = new CustoLogistico();
            pedagio.setSimulacaoId(simulacaoId);
            pedagio.setDescricao("Pedágios (" + dto.pedagios().quantidadePedagios() + " praças)");
            pedagio.setValor(dto.pedagios().valorTotalReais());
            pedagio.setTipo("PEDAGIO");
            pedagio.setCriadoEm(OffsetDateTime.now());
            custos.add(pedagio);
        }

        return custos;
    }
}
