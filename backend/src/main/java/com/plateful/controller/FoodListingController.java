package com.plateful.controller;

import com.plateful.dto.food.FoodListingResponse;
import com.plateful.service.FoodListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/foods")
@RequiredArgsConstructor
public class FoodListingController {

    private final FoodListingService foodListingService;

    /** Public — browse all available food listings */
    @GetMapping
    public ResponseEntity<List<FoodListingResponse>> getAllListings(
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(foodListingService.getAvailableListings(null, null, null, category));
    }

    /** Public — browse nearby food listings */
    @GetMapping("/nearby")
    public ResponseEntity<List<FoodListingResponse>> getNearbyListings(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "10") Double radius,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(foodListingService.getAvailableListings(lat, lng, radius, category));
    }

    /** Public — get listing details */
    @GetMapping("/{id}")
    public ResponseEntity<FoodListingResponse> getListing(@PathVariable UUID id) {
        return ResponseEntity.ok(foodListingService.getListingById(id));
    }

    /** Public — browse listings by type (SURPRISE_BOX, NEAR_EXPIRY) */
    @GetMapping("/type/{listingType}")
    public ResponseEntity<List<FoodListingResponse>> getListingsByType(
            @PathVariable String listingType) {
        return ResponseEntity.ok(foodListingService.getListingsByType(listingType.toUpperCase()));
    }
}
