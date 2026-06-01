package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.catalogo.ProdutoSinonimo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoSinonimoRepository extends JpaRepository<ProdutoSinonimo, Long> {
}
