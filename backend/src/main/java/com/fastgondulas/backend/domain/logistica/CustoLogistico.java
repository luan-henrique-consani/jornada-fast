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

@Entity
@Table(name = "custo_logistico", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustoLogistico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "simulacao_id")
    private Long simulacaoId;

    @Column(name = "descricao", length = 255)
    private String descricao;

    @Column(name = "valor", precision = 14, scale = 2)
    private BigDecimal valor;

    @Column(name = "tipo", length = 50)
    private String tipo;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;
}
