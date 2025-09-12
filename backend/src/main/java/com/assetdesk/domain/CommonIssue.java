package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "common_issues")
@Data
public class CommonIssue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(columnDefinition = "TEXT")
    private String steps; // simple newline separated steps
    private String category; // e.g., Laptop, Network, Printer
}


