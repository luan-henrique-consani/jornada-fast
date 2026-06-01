package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.logistica.FatorAjuste;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FatorAjusteRepository extends JpaRepository<FatorAjuste, Long> {
}
