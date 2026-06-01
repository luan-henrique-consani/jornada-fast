package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.RestricaoRegiao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestricaoRegiaoRepository extends JpaRepository<RestricaoRegiao, Long> {
}
