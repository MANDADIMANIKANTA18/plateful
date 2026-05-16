package com.plateful.dto.user;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserProfileResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private Double latitude;
    private Double longitude;
    private Double nearMeRadiusKm;
    private String avatarUrl;
    private Instant createdAt;
}
