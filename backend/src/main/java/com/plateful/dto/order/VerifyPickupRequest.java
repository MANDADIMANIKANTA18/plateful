package com.plateful.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyPickupRequest {

    @NotBlank(message = "Pickup code is required")
    @Size(min = 6, max = 6, message = "Pickup code must be 6 digits")
    private String pickupCode;
}
