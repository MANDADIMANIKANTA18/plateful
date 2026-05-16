package com.plateful.dto.food;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class CreateListingRequest {

    @NotBlank(message = "Food name is required")
    @Size(max = 200)
    private String foodName;

    private String description;
    private String imageUrl;

    @NotNull(message = "Original price is required")
    @DecimalMin(value = "0.01")
    private BigDecimal originalPrice;

    @Min(0) @Max(100)
    private int discountPercent;

    @NotNull(message = "Quantity is required")
    @Min(1)
    private Integer quantityAvailable;

    @Size(max = 50)
    private String category;

    @NotNull(message = "Pickup start time is required")
    private Instant pickupStartTime;

    @NotNull(message = "Pickup end time is required")
    private Instant pickupEndTime;

    // --- New fields ---

    /** REGULAR (default), SURPRISE_BOX, or NEAR_EXPIRY */
    private String listingType;

    /** The estimated value of surprise box contents */
    private BigDecimal boxValue;

    /** Expiry date for near-expiry items */
    private Instant expiryDate;

    /** Brand name for supermarket/store items */
    private String brand;
}
