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

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "restricao_regiao", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestricaoRegiao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "uf", length = 2)
    private String uf;

    @Column(name = "cidade", length = 100)
    private String cidade;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::logistica.tipo_veiculo")
    @Column(name = "tipo_veiculo", columnDefinition = "logistica.tipo_veiculo")
    private TipoVeiculo tipoVeiculo;

    @Column(name = "bloqueado")
    private boolean bloqueado;

    @Column(name = "motivo", columnDefinition = "text")
    private String motivo;

    @Column(name = "vigente_desde")
    private LocalDate vigenteDesde;

    @Column(name = "vigente_ate")
    private LocalDate vigenteAte;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
