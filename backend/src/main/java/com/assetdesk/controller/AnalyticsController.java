package com.assetdesk.controller;

import com.assetdesk.domain.Asset;
import com.assetdesk.repository.AssetRepository;
import com.assetdesk.repository.ServiceRecordRepository;
import com.assetdesk.repository.AssetAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AssetRepository assetRepository;
    private final ServiceRecordRepository serviceRecordRepository;
    private final AssetAllocationRepository allocationRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        List<Asset> assets = assetRepository.findAll();
        
        // Asset distribution by category
        Map<String, Long> assetsByCategory = assets.stream()
                .filter(a -> a.getCategory() != null)
                .collect(Collectors.groupingBy(
                    a -> a.getCategory().name(),
                    Collectors.counting()
                ));
        
        // Asset distribution by status
        Map<String, Long> assetsByStatus = assets.stream()
                .filter(a -> a.getStatus() != null)
                .collect(Collectors.groupingBy(
                    a -> a.getStatus().name(),
                    Collectors.counting()
                ));
        
        // Asset distribution by type
        Map<String, Long> assetsByType = assets.stream()
                .filter(a -> a.getType() != null)
                .collect(Collectors.groupingBy(
                    a -> a.getType().name(),
                    Collectors.counting()
                ));
        
        // Cost analysis
        List<BigDecimal> costs = assets.stream()
                .map(Asset::getCost)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        
        Map<String, Object> costAnalysis = new HashMap<>();
        if (!costs.isEmpty()) {
            costAnalysis.put("totalValue", costs.stream().reduce(BigDecimal.ZERO, BigDecimal::add));
            costAnalysis.put("averageValue", costs.stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(costs.size()), 2, BigDecimal.ROUND_HALF_UP));
            costAnalysis.put("highestValue", costs.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO));
            costAnalysis.put("lowestValue", costs.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO));
        }
        
        // Warranty analysis
        LocalDate now = LocalDate.now();
        LocalDate thirtyDaysFromNow = now.plusDays(30);
        
        long expiredCount = assets.stream()
                .filter(a -> a.getWarrantyExpiryDate() != null && a.getWarrantyExpiryDate().isBefore(now))
                .count();
        
        long expiringCount = assets.stream()
                .filter(a -> a.getWarrantyExpiryDate() != null && 
                           a.getWarrantyExpiryDate().isAfter(now) && 
                           a.getWarrantyExpiryDate().isBefore(thirtyDaysFromNow))
                .count();
        
        long validCount = assets.stream()
                .filter(a -> a.getWarrantyExpiryDate() != null && 
                           a.getWarrantyExpiryDate().isAfter(thirtyDaysFromNow))
                .count();
        
        Map<String, Object> warrantyAnalysis = new HashMap<>();
        warrantyAnalysis.put("expiredCount", expiredCount);
        warrantyAnalysis.put("expiringCount", expiringCount);
        warrantyAnalysis.put("validCount", validCount);
        
        // Utilization metrics
        long totalAssets = assets.size();
        long allocatedAssets = assets.stream()
                .filter(a -> a.getStatus() != null && "ALLOCATED".equals(a.getStatus().name()))
                .count();
        long availableAssets = assets.stream()
                .filter(a -> a.getStatus() != null && "AVAILABLE".equals(a.getStatus().name()))
                .count();
        long maintenanceAssets = assets.stream()
                .filter(a -> a.getStatus() != null && "MAINTENANCE".equals(a.getStatus().name()))
                .count();
        long retiredAssets = assets.stream()
                .filter(a -> a.getStatus() != null && "RETIRED".equals(a.getStatus().name()))
                .count();
        
        Map<String, Object> utilizationMetrics = new HashMap<>();
        if (totalAssets > 0) {
            utilizationMetrics.put("allocationRate", (double) allocatedAssets / totalAssets * 100);
            utilizationMetrics.put("availabilityRate", (double) availableAssets / totalAssets * 100);
            utilizationMetrics.put("maintenanceRate", (double) maintenanceAssets / totalAssets * 100);
            utilizationMetrics.put("retiredRate", (double) retiredAssets / totalAssets * 100);
        }
        
        analytics.put("assetsByCategory", assetsByCategory);
        analytics.put("assetsByStatus", assetsByStatus);
        analytics.put("assetsByType", assetsByType);
        analytics.put("costAnalysis", costAnalysis);
        analytics.put("warrantyAnalysis", warrantyAnalysis);
        analytics.put("utilizationMetrics", utilizationMetrics);
        
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/assets")
    public ResponseEntity<Map<String, Object>> getAssetAnalytics(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        
        List<Asset> assets = assetRepository.findAll();
        
        // Apply filters
        if (category != null && !category.isEmpty()) {
            assets = assets.stream()
                    .filter(a -> a.getCategory() != null && category.equals(a.getCategory().name()))
                    .collect(Collectors.toList());
        }
        
        if (type != null && !type.isEmpty()) {
            assets = assets.stream()
                    .filter(a -> a.getType() != null && type.equals(a.getType().name()))
                    .collect(Collectors.toList());
        }
        
        if (status != null && !status.isEmpty()) {
            assets = assets.stream()
                    .filter(a -> a.getStatus() != null && status.equals(a.getStatus().name()))
                    .collect(Collectors.toList());
        }
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalAssets", assets.size());
        analytics.put("filteredAssets", assets);
        
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/depreciation")
    public ResponseEntity<Map<String, Object>> getDepreciationReport(
            @RequestParam(required = false) String asOfDate) {
        
        Map<String, Object> depreciationReport = new HashMap<>();
        List<Asset> assets = assetRepository.findAll();
        
        // Simple depreciation calculation (straight-line method)
        // Assuming 3-year depreciation period for hardware, 1-year for software
        LocalDate calculationDate = asOfDate != null ? LocalDate.parse(asOfDate) : LocalDate.now();
        
        BigDecimal totalDepreciation = BigDecimal.ZERO;
        Map<String, BigDecimal> depreciationByCategory = new HashMap<>();
        
        for (Asset asset : assets) {
            if (asset.getCost() != null && asset.getPurchaseDate() != null) {
                long daysSincePurchase = asset.getPurchaseDate().until(calculationDate).getDays();
                int depreciationPeriodDays = asset.getCategory() != null && 
                    "SOFTWARE".equals(asset.getCategory().name()) ? 365 : 1095; // 1 year vs 3 years
                
                BigDecimal depreciationRate = BigDecimal.valueOf(Math.min(1.0, (double) daysSincePurchase / depreciationPeriodDays));
                BigDecimal assetDepreciation = asset.getCost().multiply(depreciationRate);
                
                totalDepreciation = totalDepreciation.add(assetDepreciation);
                
                String category = asset.getCategory() != null ? asset.getCategory().name() : "UNKNOWN";
                depreciationByCategory.merge(category, assetDepreciation, BigDecimal::add);
            }
        }
        
        depreciationReport.put("totalDepreciation", totalDepreciation);
        depreciationReport.put("depreciationByCategory", depreciationByCategory);
        depreciationReport.put("calculationDate", calculationDate);
        
        return ResponseEntity.ok(depreciationReport);
    }

    @GetMapping("/warranty")
    public ResponseEntity<Map<String, Object>> getWarrantyReport() {
        List<Asset> assets = assetRepository.findAll();
        LocalDate now = LocalDate.now();
        
        Map<String, Object> warrantyReport = new HashMap<>();
        
        List<Map<String, Object>> expiringAssets = assets.stream()
                .filter(a -> a.getWarrantyExpiryDate() != null && 
                           a.getWarrantyExpiryDate().isAfter(now) && 
                           a.getWarrantyExpiryDate().isBefore(now.plusDays(90)))
                .map(a -> {
                    Map<String, Object> assetInfo = new HashMap<>();
                    assetInfo.put("id", a.getId());
                    assetInfo.put("name", a.getName());
                    assetInfo.put("assetTag", a.getAssetTag());
                    assetInfo.put("warrantyEndDate", a.getWarrantyExpiryDate());
                    assetInfo.put("daysRemaining", now.until(a.getWarrantyExpiryDate()).getDays());
                    return assetInfo;
                })
                .collect(Collectors.toList());
        
        warrantyReport.put("expiringAssets", expiringAssets);
        warrantyReport.put("totalExpiring", expiringAssets.size());
        
        return ResponseEntity.ok(warrantyReport);
    }

    @GetMapping("/utilization")
    public ResponseEntity<Map<String, Object>> getUtilizationReport() {
        List<Asset> assets = assetRepository.findAll();
        
        Map<String, Object> utilizationReport = new HashMap<>();
        
        // Calculate utilization rates by category
        Map<String, Map<String, Long>> utilizationByCategory = assets.stream()
                .filter(a -> a.getCategory() != null && a.getStatus() != null)
                .collect(Collectors.groupingBy(
                    a -> a.getCategory().name(),
                    Collectors.groupingBy(
                        a -> a.getStatus().name(),
                        Collectors.counting()
                    )
                ));
        
        utilizationReport.put("utilizationByCategory", utilizationByCategory);
        
        return ResponseEntity.ok(utilizationReport);
    }
}