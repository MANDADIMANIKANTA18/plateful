package com.plateful.service;

import com.plateful.model.entity.FoodListing;
import com.plateful.repository.FoodListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FoodListingScheduler {

    private final FoodListingRepository foodListingRepository;

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void processFoodListings() {
        Instant now = Instant.now();
        
        // 1. Process Expiries
        List<FoodListing> expiredListings = foodListingRepository.findByIsActiveTrueAndPickupEndTimeBefore(now);
        if (!expiredListings.isEmpty()) {
            expiredListings.forEach(listing -> {
                listing.setIsActive(false);
                log.info("Listing {} has expired and is now inactive.", listing.getId());
            });
            foodListingRepository.saveAll(expiredListings);
        }

        // 2. Process Dynamic Pricing
        List<FoodListing> eligibleListings = foodListingRepository.findEligibleForDynamicPricing();
        List<FoodListing> listingsToUpdate = eligibleListings.stream()
                .filter(listing -> {
                    Instant thresholdTime = listing.getPickupEndTime()
                            .minus(listing.getPriceDropThresholdHours(), ChronoUnit.HOURS);
                    return now.isAfter(thresholdTime);
                })
                .peek(listing -> {
                    log.info("Applying dynamic pricing to listing {}: dropping price from {} to {}", 
                            listing.getId(), listing.getSellingPrice(), listing.getMinimumPrice());
                    listing.setSellingPrice(listing.getMinimumPrice());
                })
                .toList();

        if (!listingsToUpdate.isEmpty()) {
            foodListingRepository.saveAll(listingsToUpdate);
        }
    }
}
