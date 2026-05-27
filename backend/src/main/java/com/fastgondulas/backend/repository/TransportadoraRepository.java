package com.fastgondulas.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fastgondulas.backend.domain.core.Transportadora;

@Repository
public interface TranspostadoraRepository extends JpaRepository<Transportadora, Long>{
    
}
