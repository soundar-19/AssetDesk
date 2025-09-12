package com.assetdesk.controller;

import com.assetdesk.dto.dashboard.DashboardStatsDTO;
import com.assetdesk.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            DashboardStatsDTO stats = dashboardService.getDashboardStats(userEmail);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            // Return empty stats instead of error to prevent frontend crash
            return ResponseEntity.ok(DashboardStatsDTO.builder().build());
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Dashboard API is working");
    }
}