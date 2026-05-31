package com.fastgondulas.backend.domain.core;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "item_ordem_compra", schema = "core")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemOrdemCompra {
    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private long id;

    @Column(name = "ordem_compra_id")
    private long ordemCompraId;

    @Column(name = "codigo_produto")
    private String codigoProduto;

    @Column(name = "descricao")
    private String descricao;

    @Column(name = "quantidade")
    private BigDecimal quantidade;

    @Column(name = "unidade")
    private String unidade;

    @Column(name = "criado_em")
    private LocalDateTime criandoEm;
    
}
