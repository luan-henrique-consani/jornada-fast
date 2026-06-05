package com.fastgondulas.backend.service;

import com.fastgondulas.backend.domain.core.Usuario;
import com.fastgondulas.backend.domain.dto.CadastroRequest;
import com.fastgondulas.backend.domain.dto.LoginRequest;
import com.fastgondulas.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Serviço legado mantido por compatibilidade.
 * Para novas integrações usar AuthService + /api/auth/*.
 */
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public void criarUsuario(CadastroRequest dto) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));
        usuario.setCriadoEm(LocalDateTime.now());
        usuarioRepository.save(usuario);
    }

    public boolean login(LoginRequest dto) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(dto.email());
        if (usuarioOptional.isEmpty()) return false;
        return passwordEncoder.matches(dto.senha(), usuarioOptional.get().getSenha());
    }
}
