package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.PropostaVersao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropostaVersaoRepository extends JpaRepository<PropostaVersao, Long> {
}
