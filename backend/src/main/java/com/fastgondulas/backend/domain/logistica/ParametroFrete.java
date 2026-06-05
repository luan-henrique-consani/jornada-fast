package com.fastgondulas.backend.domain.logistica;

import jakarta.persistence.Column;
import org.hibernate.annotations.ColumnTransformer;
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
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "parametro_frete", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ParametroFrete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::logistica.tipo_veiculo")
    @Column(name = "tipo_veiculo", columnDefinition = "logistica.tipo_veiculo")
    private TipoVeiculo tipoVeiculo;

    @Column(name = "descricao", length = 255)
    private String descricao;

    @Column(name = "fator_metro_m3", precision = 10, scale = 6)
    private BigDecimal fatorMetroM3;

    @Column(name = "margem_nvia", precision = 8, scale = 6)
    private BigDecimal margemNvia;

    @Column(name = "margem_venda", precision = 8, scale = 6)
    private BigDecimal margemVenda;

    @Column(name = "vigente_desde")
    private LocalDate vigenteDesde;

    @Column(name = "vigente_ate")
    private LocalDate vigenteAte;

    @Column(name = "ativo")
    private boolean ativo;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
