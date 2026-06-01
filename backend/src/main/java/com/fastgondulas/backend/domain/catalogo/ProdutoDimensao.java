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
@Table(name = "produto_dimensao", schema = "catalogo")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProdutoDimensao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "produto_id")
    private Long produtoId;

    @Column(name = "comprimento_m", precision = 10, scale = 4)
    private BigDecimal comprimentoM;

    @Column(name = "largura_m", precision = 10, scale = 4)
    private BigDecimal larguraM;

    @Column(name = "altura_m", precision = 10, scale = 4)
    private BigDecimal alturaM;

    @Column(name = "volume_unitario_m3", precision = 18, scale = 8)
    private BigDecimal volumeUnitarioM3;

    @Column(name = "vigente_desde")
    private LocalDate vigentDesde;

    @Column(name = "vigente_ate")
    private LocalDate vigenteAte;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
