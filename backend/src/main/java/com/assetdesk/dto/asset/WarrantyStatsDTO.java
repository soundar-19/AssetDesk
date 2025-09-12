package com.assetdesk.dto.asset;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class WarrantyStatsDTO {
    private long totalAssets;
    private long expiredWarranties;
    private long expiringIn30Days;
    private long expiringIn90Days;
    private long validWarranties;
}