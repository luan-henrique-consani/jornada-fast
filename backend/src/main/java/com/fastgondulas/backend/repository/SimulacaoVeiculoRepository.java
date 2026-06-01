package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.SimulacaoVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SimulacaoVeiculoRepository extends JpaRepository<SimulacaoVeiculo, Long> {
}
