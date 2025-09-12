package com.assetdesk.dto.user;

import com.assetdesk.domain.User;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserResponseDTO {
    
    private Long id;
    private String employeeId;
    private String name;
    private String email;
    private String phoneNumber;
    private User.Role role;
    private String department;
    private String designation;
    private User.Status status;
    private LocalDate dateJoined;
    private LocalDateTime lastLogin;
    
    public static UserResponseDTO fromEntity(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setEmployeeId(user.getEmployeeId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setDepartment(user.getDepartment());
        dto.setDesignation(user.getDesignation());
        dto.setStatus(user.getStatus());
        dto.setDateJoined(user.getDateJoined());
        dto.setLastLogin(user.getLastLogin());
        return dto;
    }
}