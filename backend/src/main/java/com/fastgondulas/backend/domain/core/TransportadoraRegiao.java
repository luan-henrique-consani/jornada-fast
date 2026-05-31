package com.fastgondulas.backend.domain.core;

import java.time.LocalDateTime;

import com.fastgondulas.backend.domain.logistica.TipoVeiculo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "transportadora_regiao", schema = "core")
public class TransportadoraRegiao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "transportadora_id")
    private long transportadoraId;

    @Column(name = "uf", columnDefinition = "bpchar(2)")
    private String uf;
    
    @Column(name = "cidade")
    private String cidade;

    @Column(name = "tipo_veiculo")
    @Enumerated(EnumType.STRING)
    private TipoVeiculo tipoVeiculo;

    @Column(name = "opera")
    private boolean opera;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

}
