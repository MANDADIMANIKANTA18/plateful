package com.plateful.service;

import com.plateful.dto.food.CreateListingRequest;
import com.plateful.dto.food.FoodListingResponse;
import com.plateful.model.entity.FoodListing;
import com.plateful.model.entity.Vendor;
import com.plateful.repository.FoodListingRepository;
import com.plateful.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FoodListingService {

    private final FoodListingRepository foodListingRepository;
    private final VendorRepository vendorRepository;

    @Transactional(readOnly = true)
    public List<FoodListingResponse> getAvailableListings(Double lat, Double lng, Double radiusKm, String category) {
        List<FoodListing> listings;
        if (category != null && !category.isBlank()) {
            listings = foodListingRepository.findAvailableByCategory(Instant.now(), category);
        } else {
            listings = foodListingRepository.findAvailableListings(Instant.now());
        }

        return listings.stream()
                .map(f -> {
                    Double distanceKm = null;
                    if (lat != null && lng != null) {
                        distanceKm = haversine(lat, lng, f.getVendor().getLatitude(), f.getVendor().getLongitude());
                    }
                    return toResponse(f, distanceKm);
                })
                .filter(r -> {
                    if (radiusKm != null && r.getDistanceKm() != null) {
                        return r.getDistanceKm() <= radiusKm;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(
                        FoodListingResponse::getDistanceKm,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    @Transactional(readOnly = true)
    public FoodListingResponse getListingById(UUID id) {
        FoodListing listing = foodListingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        return toResponse(listing, null);
    }

    @Transactional
    public FoodListingResponse createListing(UUID userId, CreateListingRequest request) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found"));

        String type = request.getListingType() != null ? request.getListingType() : "REGULAR";

        BigDecimal sellingPrice = request.getOriginalPrice()
                .multiply(BigDecimal.valueOf(100 - request.getDiscountPercent()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        FoodListing listing = FoodListing.builder()
                .vendor(vendor)
                .foodName(request.getFoodName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .originalPrice(request.getOriginalPrice())
                .discountPercent(request.getDiscountPercent())
                .sellingPrice(sellingPrice)
                .quantityAvailable(request.getQuantityAvailable())
                .category(request.getCategory())
                .pickupStartTime(request.getPickupStartTime())
                .pickupEndTime(request.getPickupEndTime())
                .listingType(type)
                .boxValue(request.getBoxValue())
                .expiryDate(request.getExpiryDate())
                .brand(request.getBrand())
                .build();

        listing = foodListingRepository.save(listing);
        return toResponse(listing, null);
    }

    @Transactional(readOnly = true)
    public List<FoodListingResponse> getListingsByType(String listingType) {
        List<FoodListing> listings = foodListingRepository.findAvailableByListingType(Instant.now(), listingType);
        return listings.stream()
                .map(f -> toResponse(f, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FoodListingResponse> getVendorListings(UUID userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found"));
        return foodListingRepository.findByVendor(vendor)
                .stream()
                .map(f -> toResponse(f, null))
                .toList();
    }

    @Transactional
    public void deactivateListing(UUID userId, UUID listingId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found"));

        FoodListing listing = foodListingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (!listing.getVendor().getId().equals(vendor.getId())) {
            throw new SecurityException("Not authorized to modify this listing");
        }

        listing.setIsActive(false);
        foodListingRepository.save(listing);
    }

    private FoodListingResponse toResponse(FoodListing f, Double distanceKm) {
        Vendor v = f.getVendor();
        return FoodListingResponse.builder()
                .id(f.getId())
                .vendorId(v.getId())
                .restaurantName(v.getRestaurantName())
                .vendorLogoUrl(v.getLogoUrl())
                .foodName(f.getFoodName())
                .description(f.getDescription())
                .imageUrl(f.getImageUrl())
                .originalPrice(f.getOriginalPrice())
                .discountPercent(f.getDiscountPercent())
                .sellingPrice(f.getSellingPrice())
                .quantityAvailable(f.getQuantityAvailable() - f.getQuantitySold())
                .category(f.getCategory())
                .pickupStartTime(f.getPickupStartTime())
                .pickupEndTime(f.getPickupEndTime())
                .distanceKm(distanceKm != null ? Math.round(distanceKm * 100.0) / 100.0 : null)
                .vendorLatitude(v.getLatitude())
                .vendorLongitude(v.getLongitude())
                .vendorRating(v.getRating())
                .createdAt(f.getCreatedAt())
                .listingType(f.getListingType())
                .boxValue(f.getBoxValue())
                .expiryDate(f.getExpiryDate())
                .brand(f.getBrand())
                .vendorType(v.getVendorType())
                .build();
    }

    /** Haversine formula — distance between two GPS points in km */
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
