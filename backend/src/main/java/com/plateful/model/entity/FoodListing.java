package com.plateful.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "food_listings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FoodListing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "food_name", nullable = false, length = 200)
    private String foodName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "original_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "discount_percent", nullable = false)
    @Builder.Default
    private Integer discountPercent = 0;

    @Column(name = "selling_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "quantity_available", nullable = false)
    private Integer quantityAvailable;

    @Column(name = "quantity_sold", nullable = false)
    @Builder.Default
    private Integer quantitySold = 0;

    @Column(length = 50)
    private String category;

    @Column(name = "pickup_start_time", nullable = false)
    private Instant pickupStartTime;

    @Column(name = "pickup_end_time", nullable = false)
    private Instant pickupEndTime;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "dynamic_pricing_enabled", nullable = false)
    @Builder.Default
    private Boolean dynamicPricingEnabled = false;

    @Column(name = "minimum_price", precision = 10, scale = 2)
    private BigDecimal minimumPrice;

    @Column(name = "price_drop_threshold_hours")
    @Builder.Default
    private Integer priceDropThresholdHours = 2;

    @Column(name = "listing_type", length = 20)
    @Builder.Default
    private String listingType = "REGULAR";

    @Column(name = "box_value", precision = 10, scale = 2)
    private BigDecimal boxValue;

    @Column(name = "expiry_date")
    private Instant expiryDate;

    @Column(length = 100)
    private String brand;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
