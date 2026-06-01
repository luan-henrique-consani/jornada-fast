package com.fastgondulas.backend.repository;

import com.fastgondulas.backend.domain.catalogo.NomenclaturaMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NomenclaturaMappingRepository extends JpaRepository<NomenclaturaMapping, Long> {
}
