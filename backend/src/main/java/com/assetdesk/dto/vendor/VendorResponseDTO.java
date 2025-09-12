package com.assetdesk.dto.vendor;

import com.assetdesk.domain.Vendor;
import lombok.Data;

@Data
public class VendorResponseDTO {
    
    private Long id;
    private String name;
    private String contactPerson;
    private String email;
    private String phoneNumber;
    private String address;
    
    public static VendorResponseDTO fromEntity(Vendor vendor) {
        VendorResponseDTO dto = new VendorResponseDTO();
        dto.setId(vendor.getId());
        dto.setName(vendor.getName());
        dto.setContactPerson(vendor.getContactPerson());
        dto.setEmail(vendor.getEmail());
        dto.setPhoneNumber(vendor.getPhoneNumber());
        dto.setAddress(vendor.getAddress());
        return dto;
    }
}