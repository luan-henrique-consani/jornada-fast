package com.fastgondulas.backend.domain.catalogo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "nomenclatura_mapping", schema = "catalogo")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NomenclaturaMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "versao_id")
    private Long versaoId;

    @Column(name = "produto_origem_id")
    private Long produtoOrigemId;

    @Column(name = "produto_destino_id")
    private Long produtoDestinoId;

    @Column(name = "codigo_antigo", length = 200)
    private String codigoAntigo;

    @Column(name = "descricao_antiga", length = 1000)
    private String descricaoAntiga;

    @Column(name = "codigo_novo", length = 200)
    private String codigoNovo;

    @Column(name = "descricao_nova", length = 1000)
    private String descricaoNova;

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

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
