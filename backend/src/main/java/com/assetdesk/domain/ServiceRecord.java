package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "service_records")
@Data
public class ServiceRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "serviceRecords", "assetAllocations", "issues", "warrantyHistories"})
    private Asset asset;

    @Column(nullable = false)
    private LocalDate serviceDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String serviceDescription;

    private BigDecimal cost;
    
    private LocalDate nextServiceDate;
    
    @Column(name = "service_type")
    private String serviceType;
    
    @Column(name = "performed_by")
    private String performedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "serviceRecords", "assets"})
    private Vendor vendor;
    
    @Column(name = "status")
    private String status = "COMPLETED";
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}