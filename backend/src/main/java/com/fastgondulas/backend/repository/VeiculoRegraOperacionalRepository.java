package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.VeiculoRegraOperacional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VeiculoRegraOperacionalRepository extends JpaRepository<VeiculoRegraOperacional, Long> {
}
