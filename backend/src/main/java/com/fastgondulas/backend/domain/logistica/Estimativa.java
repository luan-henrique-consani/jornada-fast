package com.fastgondulas.backend.domain.logistica;

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
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "estimativa", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Estimativa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "public_id")
    private UUID publicId;

    @Column(name = "cliente_id")
    private Long clienteId;

    @Column(name = "ordem_compra_id")
    private Long ordemCompraId;

    @Column(name = "descricao", length = 500)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_montagem", columnDefinition = "logistica.status_montagem")
    private StatusMontagem statusMontagem;

    @Column(name = "volume_total_m3", precision = 18, scale = 8)
    private BigDecimal volumeTotalM3;

    @Column(name = "peso_total_kg", precision = 14, scale = 3)
    private BigDecimal pesoTotalKg;

    @Column(name = "mts_caminhao", precision = 14, scale = 6)
    private BigDecimal mtsCaminhao;

    @Column(name = "mts_caminhao_nvia", precision = 14, scale = 6)
    private BigDecimal mtsCaminhaoNvia;

    @Column(name = "mts_caminhao_venda", precision = 14, scale = 6)
    private BigDecimal mtsCaminhaoVenda;

    @Column(name = "snapshot_calculo", columnDefinition = "jsonb")
    private String snapshotCalculo;

    @Column(name = "calculado_em")
    private OffsetDateTime calculadoEm;

    @Column(name = "calculado_por", length = 100)
    private String calculadoPor;

    @Column(name = "ativo")
    private boolean ativo;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
