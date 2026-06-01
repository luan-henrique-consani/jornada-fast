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

import java.time.OffsetDateTime;

@Entity
@Table(name = "proposta_versao", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropostaVersao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "proposta_id")
    private Long propostaId;

    @Column(name = "numero_versao")
    private Integer numeroVersao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "logistica.status_proposta")
    private StatusProposta status;

    @Column(name = "snapshot_dados", columnDefinition = "jsonb")
    private String snapshotDados;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
