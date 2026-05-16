package com.plateful.repository;

import com.plateful.model.entity.FoodListing;
import com.plateful.model.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface FoodListingRepository extends JpaRepository<FoodListing, UUID> {

    List<FoodListing> findByVendor(Vendor vendor);

    List<FoodListing> findByVendorId(UUID vendorId);

    @Query("""
        SELECT f FROM FoodListing f
        JOIN FETCH f.vendor v
        WHERE f.isActive = true
          AND f.quantityAvailable > f.quantitySold
          AND f.pickupEndTime > :now
        ORDER BY f.createdAt DESC
        """)
    List<FoodListing> findAvailableListings(@Param("now") Instant now);

    @Query("""
        SELECT f FROM FoodListing f
        JOIN FETCH f.vendor v
        WHERE f.isActive = true
          AND f.quantityAvailable > f.quantitySold
          AND f.pickupEndTime > :now
          AND f.category = :category
        ORDER BY f.createdAt DESC
        """)
    List<FoodListing> findAvailableByCategory(@Param("now") Instant now, @Param("category") String category);

    List<FoodListing> findByIsActiveTrueAndPickupEndTimeBefore(Instant time);

    @Query("""
        SELECT f FROM FoodListing f
        WHERE f.isActive = true 
          AND f.dynamicPricingEnabled = true 
          AND f.sellingPrice > f.minimumPrice
        """)
    List<FoodListing> findEligibleForDynamicPricing();

    @Query("""
        SELECT f FROM FoodListing f
        JOIN FETCH f.vendor v
        WHERE f.isActive = true
          AND f.quantityAvailable > f.quantitySold
          AND f.pickupEndTime > :now
          AND f.listingType = :listingType
        ORDER BY f.createdAt DESC
        """)
    List<FoodListing> findAvailableByListingType(@Param("now") Instant now, @Param("listingType") String listingType);
}
