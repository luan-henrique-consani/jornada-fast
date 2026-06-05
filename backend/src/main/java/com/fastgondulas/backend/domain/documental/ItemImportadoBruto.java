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

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "item_importado_bruto", schema = "documental")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemImportadoBruto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "documento_id")
    private Long documentoId;

    @Column(name = "numero_linha")
    private Integer numeroLinha;

    @Column(name = "aba_origem", length = 100)
    private String abaOrigem;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::documental.status_item")
    @Column(name = "status", columnDefinition = "documental.status_item")
    private StatusItem status;

    @ColumnTransformer(write = "?::jsonb")
    @Column(name = "conteudo_bruto", columnDefinition = "jsonb")
    private String conteudoBruto;

    @Column(name = "texto_bruto", columnDefinition = "text")
    private String textoBruto;

    @Column(name = "confianca_extracao", precision = 5, scale = 4)
    private BigDecimal confiancaExtracao;

    @Column(name = "mensagem_erro", columnDefinition = "text")
    private String mensagemErro;

    @Column(name = "codigo_bruto", length = 200)
    private String codigoBruto;

    @Column(name = "descricao_bruta", length = 1000)
    private String descricaoBruta;

    @Column(name = "quantidade_bruta", length = 50)
    private String quantidadeBruta;

    @Column(name = "produto_id")
    private Long produtoId;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;
}
