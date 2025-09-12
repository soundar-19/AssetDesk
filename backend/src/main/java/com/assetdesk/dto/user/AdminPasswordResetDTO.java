package com.assetdesk.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminPasswordResetDTO {
    
    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "New password must be at least 6 characters long")
    private String newPassword;
}