package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.FaixaFrete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FaixaFreteRepository extends JpaRepository<FaixaFrete, Long> {
}
