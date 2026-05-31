package com.fastgondulas.backend.domain.core;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
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
@Table(name = "endereco_entrega", schema = "core")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EnderecoEntrega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "public_id")
    private UUID publicId;

    @Column(name = "cliente_id")
    private long clienteId;

    @Column(name = "logradouro", length = 255)
    private String logradouro;

    @Column(name = "numero", length = 20)
    private String numero;

    @Column(name = "complemento", length = 100)
    private String complemento;

    @Column(name = "bairro", length = 100)
    private String bairro;

    @Column(name = "cidade", length = 100)
    private String cidade;

    @Column(name = "uf", columnDefinition = "bpchar(2)")
    private String uf;

    @Column(name = "cep", length = 10)
    private String cep;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "aceita_carreta")
    private Boolean aceitaCarreta;

    @Column(name = "tem_doca")
    private Boolean temDoca;

    @Column(name = "restricao_manobra")
    private Boolean restricaoManobra;

    @Column(name = "restricao_altura_m", precision = 6, scale = 2)
    private BigDecimal restricaoAlturaM;

    @Column(name = "zona_urbana_restrita")
    private Boolean zonaUrbanaRestrita;

    @Column(name = "observacoes", columnDefinition = "text")
    private String observacoes;

    @Column(name = "ativo")
    private Boolean ativo;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;
}
