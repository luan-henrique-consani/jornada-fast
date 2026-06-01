package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.documental.DocumentoImportado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentoImportadoRepository extends JpaRepository<DocumentoImportado, Long> {
}
