package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "issue_messages")
@Data
public class IssueMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private String imageUrl;
    
    @Column(nullable = false)
    private LocalDateTime sentAt;
    
    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }
}