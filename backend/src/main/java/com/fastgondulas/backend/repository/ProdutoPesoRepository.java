package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.catalogo.ProdutoPeso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoPesoRepository extends JpaRepository<ProdutoPeso, Long> {
}
