package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "vendors")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Vendor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String contactPerson;
    private String email;
    private String phoneNumber;
    private String address;
    
    @Enumerated(EnumType.STRING)
    private Status status;
    
    public enum Status {
        ACTIVE, INACTIVE
    }
}