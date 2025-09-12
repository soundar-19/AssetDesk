package com.assetdesk.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ServiceRecordRequest {
    @NotNull(message = "Asset ID is required")
    @Positive(message = "Asset ID must be positive")
    private Long assetId;
    
    @NotBlank(message = "Service type is required")
    private String serviceType;
    
    @NotNull(message = "Service date is required")
    private LocalDate serviceDate;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Cost must be greater than 0")
    private BigDecimal cost;
    
    private Long vendorId;
    private String performedBy;
    private LocalDate nextServiceDate;
    private String notes;
}