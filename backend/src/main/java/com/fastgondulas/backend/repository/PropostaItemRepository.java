package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.PropostaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropostaItemRepository extends JpaRepository<PropostaItem, Long> {
}
