package com.plateful.repository;

import com.plateful.model.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RatingRepository extends JpaRepository<Rating, UUID> {
    Optional<Rating> findByOrderId(UUID orderId);
    List<Rating> findByVendorId(UUID vendorId);
    boolean existsByOrderId(UUID orderId);
}
