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
    private User requester;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestType requestType; // NEW or REPLACEMENT

    @Enumerated(EnumType.STRING)
    private Asset.Category requestedCategory;

    @Enumerated(EnumType.STRING)
    private Asset.AssetType requestedType;

    private String requestedModel;
    private String justification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_by_id")
    private User decisionBy;

    private LocalDateTime decisionAt;
    private String decisionRemarks;

    public enum RequestType { NEW, REPLACEMENT }

    public enum Status { PENDING, APPROVED, REJECTED }
}


