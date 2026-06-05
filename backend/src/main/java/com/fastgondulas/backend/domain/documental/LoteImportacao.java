package com.fastgondulas.backend.domain.documental;

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

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "lote_importacao", schema = "documental")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoteImportacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "public_id")
    private UUID publicId;

    @Column(name = "descricao", length = 255)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::documental.status_processamento")
    @Column(name = "status", columnDefinition = "documental.status_processamento")
    private StatusProcessamento status;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::documental.tipo_documento")
    @Column(name = "origem", columnDefinition = "documental.tipo_documento")
    private TipoDocumento origem;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
