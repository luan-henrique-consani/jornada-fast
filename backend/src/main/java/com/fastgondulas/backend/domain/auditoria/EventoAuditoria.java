package com.fastgondulas.backend.domain.auditoria;

import jakarta.persistence.Column;
import org.hibernate.annotations.ColumnTransformer;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

import java.sql.Types;
import java.time.OffsetDateTime;

@Entity
@Table(name = "evento_auditoria", schema = "auditoria")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventoAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "schema_nome", length = 100)
    private String schemaNome;

    @Column(name = "tabela_nome", length = 100)
    private String tabelaNome;

    @Column(name = "registro_id")
    private Long registroId;

    @JdbcTypeCode(Types.CHAR)
    @Column(name = "operacao", length = 1)
    private String operacao;

    @ColumnTransformer(write = "?::jsonb")
    @Column(name = "estado_anterior", columnDefinition = "jsonb")
    private String estadoAnterior;

    @ColumnTransformer(write = "?::jsonb")
    @Column(name = "estado_novo", columnDefinition = "jsonb")
    private String estadoNovo;

    @Column(name = "usuario", length = 100)
    private String usuario;

    @Column(name = "origem_acao", columnDefinition = "text")
    private String origemAcao;

    @Column(name = "ocorrido_em")
    private OffsetDateTime ocorridoEm;
}
