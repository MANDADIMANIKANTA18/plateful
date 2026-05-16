package com.plateful.service;

import com.plateful.dto.auth.AuthResponse;
import com.plateful.dto.auth.LoginRequest;
import com.plateful.dto.auth.RegisterRequest;
import com.plateful.model.entity.User;
import com.plateful.model.entity.Vendor;
import com.plateful.model.enums.Role;
import com.plateful.repository.UserRepository;
import com.plateful.repository.VendorRepository;
import com.plateful.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        String roleStr = request.getRole().toUpperCase();
        if (!roleStr.startsWith("ROLE_")) {
            roleStr = "ROLE_" + roleStr;
        }
        Role role = Role.valueOf(roleStr);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        user = userRepository.save(user);

        // If vendor, create vendor profile
        if (role == Role.ROLE_VENDOR) {
            if (request.getRestaurantName() == null || request.getAddress() == null) {
                throw new IllegalArgumentException("Restaurant name and address are required for vendors");
            }
            Vendor vendor = Vendor.builder()
                    .user(user)
                    .restaurantName(request.getRestaurantName())
                    .address(request.getAddress())
                    .latitude(request.getLatitude() != null ? request.getLatitude() : 0.0)
                    .longitude(request.getLongitude() != null ? request.getLongitude() : 0.0)
                    .phone(request.getPhone())
                    .vendorType(request.getVendorType() != null ? request.getVendorType().toUpperCase() : "RESTAURANT")
                    .build();
            vendorRepository.save(vendor);
        }

        String token = jwtTokenProvider.generateTokenForEmail(user.getEmail());

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), role.name());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
