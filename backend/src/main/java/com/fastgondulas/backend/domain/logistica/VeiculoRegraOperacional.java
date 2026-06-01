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

import java.time.OffsetDateTime;

@Entity
@Table(name = "veiculo_regra_operacional", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VeiculoRegraOperacional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "veiculo_id")
    private Long veiculoId;

    @Column(name = "descricao", length = 500)
    private String descricao;

    @Column(name = "ativo")
    private boolean ativo;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;
}
