package com.fastgondulas.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fastgondulas.backend.domain.core.TransportadoraRegiao;

@Repository
public interface TransportadoraRegiaoRepository extends JpaRepository<TransportadoraRegiao, Long> {
    
}
