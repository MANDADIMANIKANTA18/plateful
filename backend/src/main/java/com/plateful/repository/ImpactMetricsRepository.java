package com.plateful.repository;

import com.plateful.model.entity.ImpactMetrics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ImpactMetricsRepository extends JpaRepository<ImpactMetrics, UUID> {
}
