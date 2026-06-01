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
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "proposta", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Proposta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "public_id")
    private UUID publicId;

    @Column(name = "cliente_id")
    private Long clienteId;

    @Column(name = "estimativa_id")
    private Long estimativaId;

    @Column(name = "simulacao_id")
    private Long simulacaoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "logistica.status_proposta")
    private StatusProposta status;

    @Column(name = "descricao", length = 500)
    private String descricao;

    @Column(name = "valor_total", precision = 16, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "vigente_desde")
    private LocalDate vigenteDesde;

    @Column(name = "vigente_ate")
    private LocalDate vigenteAte;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
