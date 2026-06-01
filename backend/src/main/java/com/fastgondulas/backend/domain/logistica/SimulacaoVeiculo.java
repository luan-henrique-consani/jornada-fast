package com.fastgondulas.backend.domain.logistica;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "simulacao_veiculo", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SimulacaoVeiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "simulacao_id")
    private Long simulacaoId;

    @Column(name = "veiculo_id")
    private Long veiculoId;

    @Column(name = "elegivel")
    private boolean elegivel;

    @Enumerated(EnumType.STRING)
    @Column(name = "motivo_descarte", columnDefinition = "logistica.motivo_descarte")
    private MotivoDescarte motivoDescarte;

    @Column(name = "metros_usados", precision = 10, scale = 4)
    private BigDecimal metrosUsados;

    @Column(name = "custo_estimado", precision = 14, scale = 2)
    private BigDecimal custoEstimado;

    @Column(name = "selecionado")
    private boolean selecionado;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;
}
