package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.TabelaFrete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TabelaFreteRepository extends JpaRepository<TabelaFrete, Long> {
}
