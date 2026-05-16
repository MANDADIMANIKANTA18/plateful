package com.plateful.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be 6-100 characters")
    private String password;

    private String phone;

    /** "CUSTOMER" or "VENDOR" — admin accounts are seeded */
    @NotBlank(message = "Role is required")
    private String role;

    // Vendor-specific fields (required when role=VENDOR)
    private String restaurantName;
    private String address;
    private Double latitude;
    private Double longitude;

    /** RESTAURANT (default), SUPERMARKET, or STORE */
    private String vendorType;
}
