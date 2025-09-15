package com.assetdesk.dto;

import lombok.Data;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class ServiceRecordResponseDTO {
    private Long id;
    private LocalDate serviceDate;
    private String description;
    private BigDecimal cost;
    private LocalDate nextServiceDate;
    private String serviceType;
    private String performedBy;
    private String status;
    private String notes;
    
    // Asset info
    private AssetInfo asset;
    
    // Vendor info
    private VendorInfo vendor;
    

    
    @Data
    @Builder
    public static class AssetInfo {
        private Long id;
        private String assetTag;
        private String name;
        private String category;
        private String type;
        private String model;
        private String serialNumber;
        private String status;
    }
    
    @Data
    @Builder
    public static class VendorInfo {
        private Long id;
        private String name;
    }
}