package com.fastgondulas.backend.service;

import org.springframework.stereotype.Service;

import com.fastgondulas.backend.domain.core.Usuario;
import com.fastgondulas.backend.domain.dto.CadastroRequest;
import com.fastgondulas.backend.domain.dto.LoginRequest;
import com.fastgondulas.backend.repository.UsuarioRepository;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder; 

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public void criarUsuario(CadastroRequest dto){
        Usuario usuario = new Usuario();

        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());

        String senhaCriptografada = passwordEncoder.encode(dto.senha());
        usuario.setSenha(senhaCriptografada);

        usuarioRepository.save(usuario);
    }

    public boolean login(LoginRequest dto){

        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(dto.email());

        if(usuarioOptional.isEmpty()){
            return false;
        }

        Usuario usuario = usuarioOptional.get();

        boolean senhaCorreta = passwordEncoder.matches(dto.senha(), usuario.getSenha());

        return senhaCorreta;
    }
    
}
