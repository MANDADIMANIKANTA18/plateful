package com.plateful.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

public interface VendorAnalyticsDTO {
    UUID getVendorId();
    Long getTotalOrders();
    BigDecimal getTotalRevenue();
    Date getOrderDate();
}
