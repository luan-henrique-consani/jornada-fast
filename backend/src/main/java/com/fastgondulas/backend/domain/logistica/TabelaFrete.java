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
@Table(name = "tabela_frete", schema = "logistica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TabelaFrete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::logistica.tipo_veiculo")
    @Column(name = "tipo_veiculo", columnDefinition = "logistica.tipo_veiculo")
    private TipoVeiculo tipoVeiculo;

    @Column(name = "transportadora_id")
    private Long transportadoraId;

    @Column(name = "descricao", length = 255)
    private String descricao;

    @Column(name = "uf_origem", length = 2)
    private String ufOrigem;

    @Column(name = "uf_destino", length = 2)
    private String ufDestino;

    @Column(name = "vigente_desde")
    private LocalDate vigenteDesde;

    @Column(name = "vigente_ate")
    private LocalDate vigenteAte;

    @Column(name = "ativo")
    private boolean ativo;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
