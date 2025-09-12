package com.assetdesk.dto.asset;

import com.assetdesk.domain.Asset;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AssetRequestDTO {
    
    @NotBlank(message = "Asset tag is required")
    private String assetTag;
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @NotNull(message = "Category is required")
    private Asset.Category category;
    
    @NotNull(message = "Type is required")
    private Asset.AssetType type;
    
    private String model;
    private String serialNumber;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpiryDate;
    private Long vendorId;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Cost must be greater than 0")
    private BigDecimal cost;
    
    @Min(value = 1, message = "Useful life must be at least 1 year")
    @Max(value = 20, message = "Useful life seems too large")
    private Integer usefulLifeYears;
    
    @NotNull(message = "Status is required")
    private Asset.Status status;
    
    private String imageUrl;
    
    // Software license specific fields
    private Integer totalLicenses;
    private Integer usedLicenses;
    private LocalDate licenseExpiryDate;
    private String licenseKey;
    private String version;
    
    public Asset toEntity() {
        Asset asset = new Asset();
        asset.setAssetTag(this.assetTag);
        asset.setName(this.name);
        asset.setCategory(this.category);
        asset.setType(this.type);
        asset.setModel(this.model);
        asset.setSerialNumber(this.serialNumber);
        asset.setPurchaseDate(this.purchaseDate);
        asset.setWarrantyExpiryDate(this.warrantyExpiryDate);
        asset.setCost(this.cost);
        asset.setUsefulLifeYears(this.usefulLifeYears);
        asset.setStatus(this.status);
        asset.setImageUrl(this.imageUrl);
        asset.setTotalLicenses(this.totalLicenses);
        asset.setUsedLicenses(this.usedLicenses);
        asset.setLicenseExpiryDate(this.licenseExpiryDate);
        asset.setLicenseKey(this.licenseKey);
        asset.setVersion(this.version);
        return asset;
    }
}