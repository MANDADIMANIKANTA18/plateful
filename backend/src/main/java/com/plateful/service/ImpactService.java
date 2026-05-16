package com.plateful.service;

import com.plateful.model.entity.ImpactMetrics;
import com.plateful.repository.ImpactMetricsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ImpactService {

    private final ImpactMetricsRepository impactMetricsRepository;

    @Value("${app.impact.co2-per-meal-kg}")
    private double co2PerMealKg;

    public ImpactMetrics getMetrics() {
        return impactMetricsRepository.findAll()
                .stream()
                .findFirst()
                .orElse(ImpactMetrics.builder().build());
    }

    @Transactional
    public void recordCompletion(int quantity, BigDecimal revenue) {
        ImpactMetrics metrics = impactMetricsRepository.findAll()
                .stream()
                .findFirst()
                .orElse(ImpactMetrics.builder().build());

        metrics.setMealsSaved(metrics.getMealsSaved() + quantity);
        metrics.setCo2SavedKg(metrics.getCo2SavedKg().add(
                BigDecimal.valueOf(quantity * co2PerMealKg)));
        metrics.setRevenueRecovered(metrics.getRevenueRecovered().add(revenue));
        metrics.setTotalOrders(metrics.getTotalOrders() + 1);

        impactMetricsRepository.save(metrics);
    }
}
