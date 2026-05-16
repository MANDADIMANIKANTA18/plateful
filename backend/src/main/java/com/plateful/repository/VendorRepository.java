package com.plateful.repository;

import com.plateful.model.entity.Vendor;
import com.plateful.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VendorRepository extends JpaRepository<Vendor, UUID> {
    Optional<Vendor> findByUser(User user);
    Optional<Vendor> findByUserId(UUID userId);
    List<Vendor> findByVerifiedFalse();
}
