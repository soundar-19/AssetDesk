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

        if (purchaseCost.compareTo(BigDecimal.ZERO) > 0 && lifeYears != null && lifeYears > 0 && startDate != null) {
            yearsUsed = Math.max(0, (int) Math.min(lifeYears, ChronoUnit.YEARS.between(startDate, today)));
            yearlyDepreciation = purchaseCost.divide(new BigDecimal(lifeYears), 2, RoundingMode.HALF_UP);
            BigDecimal accumulated = yearlyDepreciation.multiply(new BigDecimal(yearsUsed));
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


