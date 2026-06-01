package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.Proposta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropostaRepository extends JpaRepository<Proposta, Long> {
}
