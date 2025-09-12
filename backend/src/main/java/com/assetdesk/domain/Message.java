package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String messageText;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    private Boolean isSystemMessage = false;
    
    private Boolean isRead = false;
    
    @Lob
    private byte[] imageData;
    
    private String imageType;
    
    private String fileName;
}