package com.fastgondulas.backend.domain.logistica;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "simulacao_logistica", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SimulacaoLogistica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "public_id")
    private UUID publicId;

    @Column(name = "estimativa_id")
    private Long estimativaId;

    @Column(name = "transportadora_id")
    private Long transportadoraId;

    @Column(name = "endereco_id")
    private Long enderecoId;

    @Column(name = "veiculo_selecionado_id")
    private Long veiculoSelecionadoId;

    @Column(name = "snapshot_frete", columnDefinition = "jsonb")
    private String snapshotFrete;

    @Column(name = "custo_frete_total", precision = 14, scale = 2)
    private BigDecimal custoFreteTotal;

    @Column(name = "custo_pedagio_total", precision = 14, scale = 2)
    private BigDecimal custoPedagioTotal;

    @Column(name = "observacoes", columnDefinition = "text")
    private String observacoes;

    @Column(name = "simulado_em")
    private OffsetDateTime simuladoEm;

    @Column(name = "simulado_por", length = 100)
    private String simuladoPor;
}
