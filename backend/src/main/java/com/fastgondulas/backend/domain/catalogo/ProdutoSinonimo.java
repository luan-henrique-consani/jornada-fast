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
@Table(name = "produto_sinonimo", schema = "catalogo")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProdutoSinonimo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "produto_id")
    private Long produtoId;

    @Column(name = "sinonimo", length = 500)
    private String sinonimo;

    @Column(name = "fonte", length = 100)
    private String fonte;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;
}
