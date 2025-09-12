package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "warranty_history")
@Data
public class WarrantyHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    private LocalDate oldExpiryDate;
    private LocalDate newExpiryDate;

    @Column(nullable = false)
    private LocalDateTime changedAt = LocalDateTime.now();

    private String reason;
}


