package com.assetdesk.dto.vendor;

import com.assetdesk.domain.Vendor;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class VendorRequestDTO {
    
    @NotBlank(message = "Vendor name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    private String contactPerson;
    
    @Email(message = "Invalid email format")
    private String email;
    
    @Pattern(regexp = "^[\\+]?[0-9\\s\\-\\(\\)\\.\\_A-Za-z]{0,20}$", message = "Invalid phone number format")
    private String phoneNumber;
    
    private String address;
    
    private Vendor.Status status;
    
    public Vendor toEntity() {
        Vendor vendor = new Vendor();
        vendor.setName(this.name);
        vendor.setContactPerson(this.contactPerson);
        vendor.setEmail(this.email);
        vendor.setPhoneNumber(this.phoneNumber);
        vendor.setAddress(this.address);
        vendor.setStatus(this.status != null ? this.status : Vendor.Status.ACTIVE);
        return vendor;
    }
}