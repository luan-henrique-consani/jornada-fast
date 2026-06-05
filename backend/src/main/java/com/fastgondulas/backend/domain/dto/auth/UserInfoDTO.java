package com.fastgondulas.backend.domain.dto.auth;

public record UserInfoDTO(
        long id,
        String name,
        String email,
        String role
) {}
