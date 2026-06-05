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
@Table(name = "estimativa_item", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EstimativaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "estimativa_id")
    private Long estimativaId;

    @Column(name = "produto_id")
    private Long produtoId;

    @Column(name = "item_importado_id")
    private Long itemImportadoId;

    @Column(name = "descricao_item", length = 1000)
    private String descricaoItem;

    @Column(name = "quantidade", precision = 14, scale = 4)
    private BigDecimal quantidade;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::logistica.metodo_volumetria")
    @Column(name = "metodo_volumetria", columnDefinition = "logistica.metodo_volumetria")
    private MetodoVolumetria metodoVolumetria;

    @Column(name = "qtd_por_m3_usado", precision = 18, scale = 10)
    private BigDecimal qtdPorM3Usado;

    @Column(name = "qtd_por_m3_override")
    private boolean qtdPorM3Override;

    @Column(name = "fator_ajuste_usado", precision = 10, scale = 6)
    private BigDecimal fatorAjusteUsado;

    @Column(name = "fator_montagem_usado", precision = 10, scale = 6)
    private BigDecimal fatorMontagemUsado;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::logistica.status_montagem")
    @Column(name = "status_montagem_item", columnDefinition = "logistica.status_montagem")
    private StatusMontagem statusMontagemItem;

    @Column(name = "comprimento_m_usado", precision = 10, scale = 4)
    private BigDecimal comprimentoMUsado;

    @Column(name = "largura_m_usado", precision = 10, scale = 4)
    private BigDecimal larguraMUsado;

    @Column(name = "altura_m_usado", precision = 10, scale = 4)
    private BigDecimal alturaMUsado;

    @Column(name = "volume_unitario_m3", precision = 18, scale = 8)
    private BigDecimal volumeUnitarioM3;

    @Column(name = "volume_bruto_m3", precision = 18, scale = 8)
    private BigDecimal volumeBrutoM3;

    @Column(name = "volume_ajustado_m3", precision = 18, scale = 8)
    private BigDecimal volumeAjustadoM3;

    @Column(name = "peso_bruto_kg", precision = 12, scale = 3)
    private BigDecimal pesoBrutoKg;

    @Column(name = "categoria_nome", length = 100)
    private String categoriaNome;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;
}
