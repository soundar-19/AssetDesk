package com.assetdesk.service.impl;

import com.assetdesk.domain.Asset;
import com.assetdesk.repository.AssetRepository;
import com.assetdesk.service.DepreciationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DepreciationServiceImpl implements DepreciationService {

    private final AssetRepository assetRepository;

    @Override
    public Map<String, Object> getDepreciation(Long assetId, LocalDate asOfDate) {
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new RuntimeException("Asset not found: " + assetId));

        Map<String, Object> response = new HashMap<>();

        BigDecimal purchaseCost = asset.getCost() != null ? asset.getCost() : BigDecimal.ZERO;
        Integer lifeYears = asset.getUsefulLifeYears();
        LocalDate startDate = asset.getPurchaseDate();
        LocalDate today = asOfDate != null ? asOfDate : LocalDate.now();

        BigDecimal currentValue = purchaseCost;
        BigDecimal yearlyDepreciation = BigDecimal.ZERO;
        long yearsUsed = 0;

        // Use default useful life of 5 years if not specified
        if (lifeYears == null || lifeYears <= 0) {
            lifeYears = 5; // Default useful life for assets
        }
        
        if (purchaseCost.compareTo(BigDecimal.ZERO) > 0 && startDate != null) {
            yearsUsed = Math.max(0, ChronoUnit.YEARS.between(startDate, today));
            // Ensure years used doesn't exceed useful life
            yearsUsed = Math.min(yearsUsed, lifeYears);
            yearlyDepreciation = purchaseCost.divide(BigDecimal.valueOf(lifeYears), 2, RoundingMode.HALF_UP);
            BigDecimal accumulated = yearlyDepreciation.multiply(BigDecimal.valueOf(yearsUsed));
            currentValue = purchaseCost.subtract(accumulated);
            if (currentValue.compareTo(BigDecimal.ZERO) < 0) {
                currentValue = BigDecimal.ZERO;
            }
        }

        response.put("assetId", assetId);
        response.put("purchaseCost", purchaseCost);
        response.put("usefulLifeYears", lifeYears);
        response.put("purchaseDate", startDate);
        response.put("asOfDate", today);
        response.put("yearsUsed", yearsUsed);
        response.put("yearlyDepreciation", yearlyDepreciation);
        response.put("currentValue", currentValue);

        return response;
    }
}


