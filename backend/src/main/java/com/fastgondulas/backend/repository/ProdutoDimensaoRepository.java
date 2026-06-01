package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.catalogo.ProdutoDimensao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoDimensaoRepository extends JpaRepository<ProdutoDimensao, Long> {
}
