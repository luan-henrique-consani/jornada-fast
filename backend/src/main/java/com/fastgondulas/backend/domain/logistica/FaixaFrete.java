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
@Table(name = "faixa_frete", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FaixaFrete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "tabela_id")
    private Long tabelaId;

    @Column(name = "metros_min", precision = 10, scale = 4)
    private BigDecimal metrosMin;

    @Column(name = "metros_max", precision = 10, scale = 4)
    private BigDecimal metrosMax;

    @Column(name = "custo_por_metro", precision = 14, scale = 4)
    private BigDecimal custoPorMetro;

    @Column(name = "custo_minimo", precision = 14, scale = 2)
    private BigDecimal custoMinimo;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;
}
