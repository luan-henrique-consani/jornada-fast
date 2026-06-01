package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.catalogo.VersaoNomenclatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VersaoNomenclaturaRepository extends JpaRepository<VersaoNomenclatura, Long> {
}
