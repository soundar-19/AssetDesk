package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    private Type type;
    
    private Boolean isRead = false;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private Long relatedIssueId;
    private Long relatedAssetId;
    
    public enum Type {
        INFO, SUCCESS, WARNING, ERROR,
        ISSUE_ASSIGNED, ISSUE_UPDATED, ISSUE_RESOLVED, NEW_MESSAGE,
        ASSET_ALLOCATED, ASSET_RETURNED, 
        MAINTENANCE_DUE, WARRANTY_EXPIRING, SYSTEM_ALERT
    }
}