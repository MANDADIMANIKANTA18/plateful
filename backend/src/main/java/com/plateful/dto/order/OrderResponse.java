package com.plateful.dto.order;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {
    private UUID id;
    private UUID userId;
    private UUID listingId;
    private UUID vendorId;
    private String foodName;
    private String restaurantName;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private String orderStatus;
    private String razorpayOrderId;
    private String pickupCode;
    private Instant pickupStartTime;
    private Instant pickupEndTime;
    private Instant createdAt;
}
