package com.fastgondulas.backend.domain.catalogo;

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

@Entity
@Table(name = "produto_categoria", schema = "catalogo")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProdutoCategoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "nome", length = 100)
    private String nome;

    @Column(name = "codigo", length = 50)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::catalogo.tipo_linha")
    @Column(name = "linha", columnDefinition = "catalogo.tipo_linha")
    private TipoLinha linha;

    @Column(name = "ativo")
    private boolean ativo;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;
}
