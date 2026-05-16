package com.plateful.controller;

import com.plateful.model.entity.ImpactMetrics;
import com.plateful.service.ImpactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/impact")
@RequiredArgsConstructor
public class ImpactController {

    private final ImpactService impactService;

    /** Public — get platform impact metrics */
    @GetMapping
    public ResponseEntity<ImpactMetrics> getImpact() {
        return ResponseEntity.ok(impactService.getMetrics());
    }
}
