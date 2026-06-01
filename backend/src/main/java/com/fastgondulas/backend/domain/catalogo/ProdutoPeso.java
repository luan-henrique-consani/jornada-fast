package com.fastgondulas.backend.domain.catalogo;

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
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "produto_peso", schema = "catalogo")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProdutoPeso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "produto_id")
    private Long produtoId;

    @Column(name = "peso_bruto_kg", precision = 12, scale = 3)
    private BigDecimal pesoBrutoKg;

    @Column(name = "peso_liquido_kg", precision = 12, scale = 3)
    private BigDecimal pesoLiquidoKg;

    @Column(name = "vigente_desde")
    private LocalDate vigenteDesde;

    @Column(name = "vigente_ate")
    private LocalDate vigenteAte;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
