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
import java.time.OffsetDateTime;

@Entity
@Table(name = "veiculo_tipo", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VeiculoTipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "nome", length = 100)
    private String nome;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::logistica.tipo_veiculo")
    @Column(name = "tipo", columnDefinition = "logistica.tipo_veiculo")
    private TipoVeiculo tipo;

    @Column(name = "comprimento_m", precision = 8, scale = 3)
    private BigDecimal comprimentoM;

    @Column(name = "largura_m", precision = 8, scale = 3)
    private BigDecimal larguraM;

    @Column(name = "altura_m", precision = 8, scale = 3)
    private BigDecimal alturaM;

    @Column(name = "comprimento_interno_m", precision = 8, scale = 3)
    private BigDecimal comprimentoInternoM;

    @Column(name = "largura_interna_m", precision = 8, scale = 3)
    private BigDecimal larguraInternaM;

    @Column(name = "altura_interna_m", precision = 8, scale = 3)
    private BigDecimal alturaInternaM;

    @Column(name = "capacidade_m3_nominal", precision = 10, scale = 4)
    private BigDecimal capacidadeM3Nominal;

    @Column(name = "capacidade_m3_operacional", precision = 10, scale = 4)
    private BigDecimal capacidadeM3Operacional;

    @Column(name = "peso_max_kg_nominal", precision = 12, scale = 3)
    private BigDecimal pesoMaxKgNominal;

    @Column(name = "peso_max_kg_operacional", precision = 12, scale = 3)
    private BigDecimal pesoMaxKgOperacional;

    @Column(name = "quantidade_eixos")
    private Integer quantidadeEixos;

    @Column(name = "custo_por_km", precision = 12, scale = 4)
    private BigDecimal custoPorKm;

    @Column(name = "pedagio_por_eixo", precision = 12, scale = 4)
    private BigDecimal pedagioPorEixo;

    @Column(name = "permite_area_urbana")
    private boolean permiteAreaUrbana;

    @Column(name = "permite_carga_fracionada")
    private boolean permiteCargaFracionada;

    @Column(name = "exige_doca")
    private boolean exigeDoca;

    @Column(name = "restricao_altura_max_m", precision = 6, scale = 2)
    private BigDecimal restricaoAlturaMaxM;

    @Column(name = "ativo")
    private boolean ativo;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
