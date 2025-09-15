package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "assets")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Asset {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String assetTag;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    private Category category;
    
    @Enumerated(EnumType.STRING)
    private AssetType type;
    
    private String model;
    private String serialNumber;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpiryDate;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;
    
    private BigDecimal cost;
    
    // Useful life of the asset in years, used for straight-line depreciation
    private Integer usefulLifeYears;
    
    @Enumerated(EnumType.STRING)
    private Status status;
    
    private String imageUrl;
    
    // Software license specific fields
    private Integer totalLicenses; // Total number of licenses available
    private Integer usedLicenses;   // Number of licenses currently in use
    private LocalDate licenseExpiryDate; // When the license expires
    private String licenseKey;      // License key or activation code
    private String version;         // Software version
    
    public enum Category {
        HARDWARE, SOFTWARE, ACCESSORIES;
        
        public AssetType[] getValidTypes() {
            return switch (this) {
                case HARDWARE -> new AssetType[]{AssetType.LAPTOP, AssetType.DESKTOP, AssetType.MONITOR, AssetType.PRINTER, AssetType.TABLET};
                case SOFTWARE -> new AssetType[]{AssetType.LICENSE};
                case ACCESSORIES -> new AssetType[]{AssetType.KEYBOARD, AssetType.MOUSE, AssetType.HEADSET, AssetType.WEBCAM, AssetType.CABLE, AssetType.ADAPTER, AssetType.CHARGER, AssetType.DOCKING_STATION};
            };
        }
    }
    
    public enum AssetType {
        LAPTOP, DESKTOP, MONITOR, PRINTER, TABLET,
        LICENSE,
        KEYBOARD, MOUSE, HEADSET, WEBCAM, CABLE, ADAPTER, CHARGER, DOCKING_STATION
    }
    
    public enum Status {
        AVAILABLE, ALLOCATED, MAINTENANCE, RETIRED, LOST
    }
}