package com.fastgondulas.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fastgondulas.backend.domain.dto.CadastroRequest;
import com.fastgondulas.backend.domain.dto.LoginRequest;
import com.fastgondulas.backend.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/autenticacao")
@RequiredArgsConstructor
public class AutenticacaoUsuarioController {
    private final UsuarioService usuarioService;
    
    @PostMapping("/cadastro")
    public ResponseEntity<String> cadastrar(@RequestBody @Valid CadastroRequest cadDto){
        usuarioService.criarUsuario(cadDto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário criado com sucesso");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest dto){
        boolean loginAutenticado = usuarioService.login(dto);

        if(loginAutenticado){
            return ResponseEntity.ok("Login Realizado com sucesso!");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("E-mail ou senha inválidos");
        }
    }
}
