package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
@Data
public class Issue {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    private IssueType type;
    
    @Enumerated(EnumType.STRING)
    private Priority priority;
    
    @Enumerated(EnumType.STRING)
    private Status status;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime resolvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;
    
    private String imageUrl;
    
    private Boolean replacementOffered;
    
    public enum IssueType {
        HARDWARE_MALFUNCTION,
        SOFTWARE_ISSUE,
        PERFORMANCE_PROBLEM,
        DAMAGE,
        MISSING_PARTS,
        CONNECTIVITY_ISSUE,
        OTHER
    }
    
    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
    
    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = Status.OPEN;
        }
        if (priority == null) {
            priority = Priority.MEDIUM;
        }
    }
}