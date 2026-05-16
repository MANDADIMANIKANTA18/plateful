package com.plateful.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 1, max = 120)
    private String name;

    @Size(max = 20)
    private String phone;

    private Double latitude;
    private Double longitude;

    /** Near-me search radius in kilometres (default 5) */
    private Double nearMeRadiusKm;
}
