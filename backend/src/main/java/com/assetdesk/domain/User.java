package com.assetdesk.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "users")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String employeeId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    private String department;
    private String designation;
    
    @Enumerated(EnumType.STRING)
    private Status status;
    
    private LocalDate dateJoined;
    private LocalDateTime lastLogin;
    
    public enum Role {
        EMPLOYEE, ADMIN, IT_SUPPORT
    }
    
    public enum Status {
        ACTIVE, INACTIVE
    }
}