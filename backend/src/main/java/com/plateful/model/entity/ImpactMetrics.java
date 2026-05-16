package com.plateful.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "impact_metrics")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ImpactMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "meals_saved", nullable = false)
    @Builder.Default
    private Long mealsSaved = 0L;

    @Column(name = "co2_saved_kg", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal co2SavedKg = BigDecimal.ZERO;

    @Column(name = "revenue_recovered", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal revenueRecovered = BigDecimal.ZERO;

    @Column(name = "total_orders", nullable = false)
    @Builder.Default
    private Long totalOrders = 0L;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
