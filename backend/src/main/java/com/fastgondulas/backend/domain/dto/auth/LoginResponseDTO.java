package com.fastgondulas.backend.domain.dto.auth;

public record LoginResponseDTO(
        String token,
        long expiresIn,
        UserInfoDTO user
) {}
