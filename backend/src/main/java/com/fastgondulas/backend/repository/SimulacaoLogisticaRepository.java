package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.SimulacaoLogistica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SimulacaoLogisticaRepository extends JpaRepository<SimulacaoLogistica, Long> {
}
