package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.ParametroFrete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParametroFreteRepository extends JpaRepository<ParametroFrete, Long> {
}
