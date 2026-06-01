package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.VeiculoTipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VeiculoTipoRepository extends JpaRepository<VeiculoTipo, Long> {
}
