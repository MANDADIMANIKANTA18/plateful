package com.plateful.controller;

import com.plateful.model.entity.Vendor;
import com.plateful.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final VendorRepository vendorRepository;
    private final com.plateful.service.OrderService orderService;

    /** Admin — list unverified vendors */
    @GetMapping("/vendors/unverified")
    public ResponseEntity<List<Vendor>> getUnverifiedVendors() {
        return ResponseEntity.ok(vendorRepository.findByVerifiedFalse());
    }

    /** Admin — verify a vendor */
    @PatchMapping("/vendors/{id}/verify")
    public ResponseEntity<Vendor> verifyVendor(@PathVariable UUID id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        vendor.setVerified(true);
        return ResponseEntity.ok(vendorRepository.save(vendor));
    }

    /** Admin — global analytics */
    @GetMapping("/analytics")
    public ResponseEntity<List<com.plateful.dto.VendorAnalyticsDTO>> getAllAnalytics() {
        return ResponseEntity.ok(orderService.getAllAnalytics());
    }
}
