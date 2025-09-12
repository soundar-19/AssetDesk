package com.assetdesk.dto.asset;

import com.assetdesk.domain.Asset;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AssetResponseDTO {
    
    private Long id;
    private String assetTag;
    private String name;
    private Asset.Category category;
    private Asset.AssetType type;
    private String model;
    private String serialNumber;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpiryDate;
    private String vendorName;
    private BigDecimal cost;
    private Asset.Status status;
    private String imageUrl;
    private Integer usefulLifeYears;
    
    // Software license specific fields
    private Integer totalLicenses;
    private Integer usedLicenses;
    private LocalDate licenseExpiryDate;
    private String licenseKey;
    private String version;
    
    public static AssetResponseDTO fromEntity(Asset asset) {
        AssetResponseDTO dto = new AssetResponseDTO();
        dto.setId(asset.getId());
        dto.setAssetTag(asset.getAssetTag());
        dto.setName(asset.getName());
        dto.setCategory(asset.getCategory());
        dto.setType(asset.getType());
        dto.setModel(asset.getModel());
        dto.setSerialNumber(asset.getSerialNumber());
        dto.setPurchaseDate(asset.getPurchaseDate());
        dto.setWarrantyExpiryDate(asset.getWarrantyExpiryDate());
        dto.setVendorName(asset.getVendor() != null ? asset.getVendor().getName() : null);
        dto.setCost(asset.getCost());
        dto.setStatus(asset.getStatus());
        dto.setImageUrl(asset.getImageUrl());
        dto.setUsefulLifeYears(asset.getUsefulLifeYears());
        dto.setTotalLicenses(asset.getTotalLicenses());
        dto.setUsedLicenses(asset.getUsedLicenses());
        dto.setLicenseExpiryDate(asset.getLicenseExpiryDate());
        dto.setLicenseKey(asset.getLicenseKey());
        dto.setVersion(asset.getVersion());
        return dto;
    }
}