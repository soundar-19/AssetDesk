package com.assetdesk.service;

import com.assetdesk.dto.vendor.VendorRequestDTO;
import com.assetdesk.dto.vendor.VendorResponseDTO;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VendorService {
    
    VendorResponseDTO createVendor(VendorRequestDTO vendorRequestDTO);
    VendorResponseDTO getVendorById(Long id);
    VendorResponseDTO getVendorByName(String name);
    Page<VendorResponseDTO> getAllVendors(Pageable pageable);
    List<VendorResponseDTO> getAllVendors();
    List<VendorResponseDTO> searchVendorsByName(String name);
    VendorResponseDTO updateVendor(Long id, VendorRequestDTO vendorRequestDTO);
    void deleteVendor(Long id);
    Page<VendorResponseDTO> getActiveVendors(Pageable pageable);
    Page<VendorResponseDTO> searchVendors(String name, String email, String phone, String status, Pageable pageable);
}