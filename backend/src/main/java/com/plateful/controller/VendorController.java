package com.plateful.controller;

import com.plateful.dto.food.CreateListingRequest;
import com.plateful.dto.food.FoodListingResponse;
import com.plateful.dto.order.OrderResponse;
import com.plateful.dto.order.VerifyPickupRequest;
import com.plateful.model.entity.Vendor;
import com.plateful.repository.VendorRepository;
import com.plateful.security.UserPrincipal;
import com.plateful.service.FoodListingService;
import com.plateful.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vendor")
@RequiredArgsConstructor
public class VendorController {

    private final FoodListingService foodListingService;
    private final OrderService orderService;
    private final VendorRepository vendorRepository;

    /** Vendor — create a new food listing */
    @PostMapping("/listings")
    public ResponseEntity<FoodListingResponse> createListing(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateListingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(foodListingService.createListing(principal.getId(), request));
    }

    /** Vendor — view their listings */
    @GetMapping("/listings")
    public ResponseEntity<List<FoodListingResponse>> getMyListings(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(foodListingService.getVendorListings(principal.getId()));
    }

    /** Vendor — deactivate a listing */
    @PatchMapping("/listings/{id}/deactivate")
    public ResponseEntity<Void> deactivateListing(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        foodListingService.deactivateListing(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    /** Vendor — delete (deactivate) a listing */
    @DeleteMapping("/listings/{id}")
    public ResponseEntity<Void> deleteListing(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        foodListingService.deactivateListing(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    /** Vendor — view incoming orders */
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getVendorOrders(
            @AuthenticationPrincipal UserPrincipal principal) {
        Vendor vendor = vendorRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found"));
        return ResponseEntity.ok(orderService.getVendorOrders(vendor.getId()));
    }

    /** Vendor — mark order as completed (customer picked up) */
    @PatchMapping("/orders/{id}/complete")
    public ResponseEntity<OrderResponse> completeOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.completeOrder(id));
    }

    /** Vendor — verify pickup code and complete order */
    @PatchMapping("/orders/{id}/verify-pickup")
    public ResponseEntity<OrderResponse> verifyPickup(
            @PathVariable UUID id,
            @Valid @RequestBody VerifyPickupRequest request) {
        return ResponseEntity.ok(orderService.verifyPickupAndComplete(id, request.getPickupCode()));
    }

    /** Vendor — analytics */
    @GetMapping("/analytics")
    public ResponseEntity<List<com.plateful.dto.VendorAnalyticsDTO>> getVendorAnalytics(
            @AuthenticationPrincipal UserPrincipal principal) {
        Vendor vendor = vendorRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found"));
        return ResponseEntity.ok(orderService.getVendorAnalytics(vendor.getId()));
    }
}
