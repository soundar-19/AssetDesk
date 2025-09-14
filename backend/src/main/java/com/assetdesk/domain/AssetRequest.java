package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_requests")
@Data
public class AssetRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestType requestType;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String assetType;

    @Column(nullable = false)
    private String assetName;

    private String preferredModel;
    private Double estimatedCost;

    @Column(nullable = false, length = 1000)
    private String businessJustification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    private String requiredDate;

    @Column(length = 1000)
    private String specifications;

    @Column(length = 1000)
    private String additionalNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    private LocalDateTime requestedDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;

    private LocalDateTime approvedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rejected_by_id")
    private User rejectedBy;

    private LocalDateTime rejectedDate;
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fulfilled_by_id")
    private User fulfilledBy;

    private LocalDateTime fulfilledDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_asset_id")
    private Asset allocatedAsset;

    private String remarks;

    public enum RequestType { NEW_ASSET, REPLACEMENT, UPGRADE, ADDITIONAL }

    public enum Priority { LOW, MEDIUM, HIGH, URGENT }

    public enum Status { PENDING, APPROVED, REJECTED, FULFILLED, CANCELLED }
}


