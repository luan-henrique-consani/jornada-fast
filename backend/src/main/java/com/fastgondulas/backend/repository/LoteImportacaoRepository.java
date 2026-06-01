package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.documental.LoteImportacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoteImportacaoRepository extends JpaRepository<LoteImportacao, Long> {
}
