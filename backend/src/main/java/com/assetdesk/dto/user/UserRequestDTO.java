package com.assetdesk.dto.user;

import com.assetdesk.domain.User;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UserRequestDTO {
    
    @NotBlank(message = "Employee ID is required")
    private String employeeId;
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotNull(message = "Role is required")
    private User.Role role;
    
    private String department;
    private String designation;
    
    @NotNull(message = "Status is required")
    private User.Status status;
    
    private LocalDate dateJoined;
    
    public User toEntity() {
        User user = new User();
        user.setEmployeeId(this.employeeId);
        user.setName(this.name);
        user.setEmail(this.email);
        user.setPhoneNumber(this.phoneNumber);
        user.setPassword(this.password);
        user.setRole(this.role);
        user.setDepartment(this.department);
        user.setDesignation(this.designation);
        user.setStatus(this.status);
        user.setDateJoined(this.dateJoined);
        return user;
    }
}