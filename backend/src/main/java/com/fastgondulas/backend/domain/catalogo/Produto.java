package com.fastgondulas.backend.domain.catalogo;

import com.fastgondulas.backend.domain.logistica.MetodoVolumetria;
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
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "produto", schema = "catalogo")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "public_id")
    private UUID publicId;

    @Column(name = "categoria_id")
    private Long categoriaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "linha", columnDefinition = "catalogo.tipo_linha")
    private TipoLinha linha;

    @Column(name = "codigo", length = 100)
    private String codigo;

    @Column(name = "codigo_legado", length = 100)
    private String codigoLegado;

    @Column(name = "descricao", length = 1000)
    private String descricao;

    @Column(name = "qtd_por_m3", precision = 18, scale = 10)
    private BigDecimal qtdPorM3;

    @Column(name = "qtd_por_m3_base", precision = 18, scale = 10)
    private BigDecimal qtdPorM3Base;

    @Column(name = "is_montante")
    private boolean isMontante;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_volumetria", columnDefinition = "logistica.metodo_volumetria")
    private MetodoVolumetria metodoVolumetria;

    @Column(name = "tem_estrutura")
    private boolean temEstrutura;

    @Column(name = "tem_configurador")
    private boolean temConfigurador;

    @Column(name = "tem_render")
    private boolean temRender;

    @Column(name = "tem_corte")
    private boolean temCorte;

    @Column(name = "observacoes", columnDefinition = "text")
    private String observacoes;

    @Column(name = "ativo")
    private boolean ativo;

    @Column(name = "vigente_desde")
    private LocalDate vigentDesde;

    @Column(name = "vigente_ate")
    private LocalDate vigenteAte;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;

    @Column(name = "atualizado_por", length = 100)
    private String atualizadoPor;
}
