package com.plateful.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type;
    private UUID userId;
    private String name;
    private String email;
    private String role;

    public AuthResponse(String token, UUID userId, String name, String email, String role) {
        this.token = token;
        this.type = "Bearer";
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
    }
}
