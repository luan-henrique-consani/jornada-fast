package com.fastgondulas.backend.service;

import com.fastgondulas.backend.domain.core.Usuario;
import com.fastgondulas.backend.domain.dto.auth.LoginRequestDTO;
import com.fastgondulas.backend.domain.dto.auth.LoginResponseDTO;
import com.fastgondulas.backend.domain.dto.auth.RegisterRequestDTO;
import com.fastgondulas.backend.domain.dto.auth.UserInfoDTO;
import com.fastgondulas.backend.domain.enums.PerfilUsuario;
import com.fastgondulas.backend.exception.ApiException;
import com.fastgondulas.backend.repository.UsuarioRepository;
import com.fastgondulas.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.email(), dto.password())
        );

        Usuario usuario = usuarioRepository.findByEmail(dto.email())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND));

        String token = jwtService.gerarToken(usuario);

        return new LoginResponseDTO(
                token,
                expirationMs / 1000,
                toUserInfoDTO(usuario)
        );
    }

    @Transactional
    public LoginResponseDTO register(RegisterRequestDTO dto) {
        if (usuarioRepository.findByEmail(dto.email()).isPresent()) {
            throw new ApiException("E-mail já cadastrado", HttpStatus.CONFLICT);
        }

        Usuario usuario = Usuario.builder()
                .publicId(UUID.randomUUID())
                .nome(dto.name())
                .email(dto.email())
                .senha(passwordEncoder.encode(dto.password()))
                .perfil(PerfilUsuario.USER)
                .criadoEm(LocalDateTime.now())
                .build();

        usuarioRepository.save(usuario);
        log.info("Usuário registrado: {}", dto.email());

        String token = jwtService.gerarToken(usuario);

        return new LoginResponseDTO(
                token,
                expirationMs / 1000,
                toUserInfoDTO(usuario)
        );
    }

    private UserInfoDTO toUserInfoDTO(Usuario usuario) {
        return new UserInfoDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil() != null ? usuario.getPerfil().name() : "USER"
        );
    }
}
