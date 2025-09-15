package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "asset_allocations")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AssetAllocation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.EAGER)


    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate allocatedDate;

    private LocalDate returnedDate;

    @Column(columnDefinition = "TEXT")
    private String remarks;
    
    private LocalDate returnRequestDate;
    
    @Column(columnDefinition = "TEXT")
    private String returnRequestRemarks;
}