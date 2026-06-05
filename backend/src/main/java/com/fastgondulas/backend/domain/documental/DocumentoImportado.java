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
@Table(name = "documento_importado", schema = "documental")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentoImportado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "public_id")
    private UUID publicId;

    @Column(name = "lote_id")
    private Long loteId;

    @Column(name = "nome_arquivo", length = 500)
    private String nomeArquivo;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::documental.tipo_documento")
    @Column(name = "tipo_documento", columnDefinition = "documental.tipo_documento")
    private TipoDocumento tipoDocumento;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "extensao", length = 20)
    private String extensao;

    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    @Column(name = "hash_sha256", length = 64)
    private String hashSha256;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::documental.status_processamento")
    @Column(name = "status", columnDefinition = "documental.status_processamento")
    private StatusProcessamento status;

    @Column(name = "mensagem_erro", columnDefinition = "text")
    private String mensagemErro;

    @Column(name = "importado_em")
    private OffsetDateTime importadoEm;

    @Column(name = "importado_por", length = 100)
    private String importadoPor;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;
}
