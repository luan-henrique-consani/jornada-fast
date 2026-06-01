package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.Estimativa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstimativaRepository extends JpaRepository<Estimativa, Long> {
}
