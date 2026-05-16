package com.plateful.dto.food;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class FoodListingResponse {
    private UUID id;
    private UUID vendorId;
    private String restaurantName;
    private String vendorLogoUrl;
    private String foodName;
    private String description;
    private String imageUrl;
    private BigDecimal originalPrice;
    private int discountPercent;
    private BigDecimal sellingPrice;
    private int quantityAvailable;
    private String category;
    private Instant pickupStartTime;
    private Instant pickupEndTime;
    private Double distanceKm;
    private Double vendorLatitude;
    private Double vendorLongitude;
    private BigDecimal vendorRating;
    private Instant createdAt;

    // --- New fields ---
    private String listingType;
    private BigDecimal boxValue;
    private Instant expiryDate;
    private String brand;
    private String vendorType;
}
