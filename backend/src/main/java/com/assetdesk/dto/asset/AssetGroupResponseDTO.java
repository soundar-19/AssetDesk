package com.assetdesk.dto.asset;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssetGroupResponseDTO {
    private String name;
    private String model;
    private String category;
    private String type;
    private Long total;
    private Long available;
    private Long allocated;
    private Long maintenance;
    private Long retired;
    private BigDecimal averageCost;
    private String vendor;
}