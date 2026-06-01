package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.catalogo.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
}
