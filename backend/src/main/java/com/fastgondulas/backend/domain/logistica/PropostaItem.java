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
@Table(name = "proposta_item", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropostaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "proposta_id")
    private Long propostaId;

    @Column(name = "produto_id")
    private Long produtoId;

    @Column(name = "descricao", length = 1000)
    private String descricao;

    @Column(name = "quantidade", precision = 14, scale = 4)
    private BigDecimal quantidade;

    @Column(name = "volume_m3", precision = 18, scale = 8)
    private BigDecimal volumeM3;

    @Column(name = "peso_kg", precision = 12, scale = 3)
    private BigDecimal pesoKg;

    @Column(name = "valor_unitario", precision = 14, scale = 4)
    private BigDecimal valorUnitario;

    @Column(name = "valor_total", precision = 16, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;
}
