package com.assetdesk.service.impl;

import com.assetdesk.dto.vendor.VendorRequestDTO;
import com.assetdesk.dto.vendor.VendorResponseDTO;
import com.assetdesk.domain.Vendor;
import com.assetdesk.repository.VendorRepository;
import com.assetdesk.service.VendorService;
import com.assetdesk.exception.ResourceNotFoundException;
import com.assetdesk.exception.DuplicateResourceException;
import org.springframework.data.jpa.domain.Specification;
import static com.assetdesk.spec.VendorSpecifications.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorServiceImpl implements VendorService {
    
    private final VendorRepository vendorRepository;
    
    @Override
    public VendorResponseDTO createVendor(VendorRequestDTO vendorRequestDTO) {
        if (vendorRepository.findByName(vendorRequestDTO.getName()).isPresent()) {
            throw new DuplicateResourceException("Vendor", "name", vendorRequestDTO.getName());
        }
        
        if (vendorRequestDTO.getEmail() != null && 
            vendorRepository.findByEmail(vendorRequestDTO.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Vendor", "email", vendorRequestDTO.getEmail());
        }
        
        Vendor vendor = vendorRequestDTO.toEntity();
        Vendor savedVendor = vendorRepository.save(vendor);
        return VendorResponseDTO.fromEntity(savedVendor);
    }
    
    @Override
    @Transactional(readOnly = true)
    public VendorResponseDTO getVendorById(Long id) {
        Vendor vendor = vendorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", id));
        return VendorResponseDTO.fromEntity(vendor);
    }
    
    @Override
    @Transactional(readOnly = true)
    public VendorResponseDTO getVendorByName(String name) {
        Vendor vendor = vendorRepository.findByName(name)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor", "name", name));
        return VendorResponseDTO.fromEntity(vendor);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<VendorResponseDTO> getAllVendors(Pageable pageable) {
        return vendorRepository.findAll(pageable)
            .map(VendorResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<VendorResponseDTO> getAllVendors() {
        return vendorRepository.findAll().stream()
            .map(VendorResponseDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<VendorResponseDTO> searchVendorsByName(String name) {
        return vendorRepository.findByNameContainingIgnoreCase(name).stream()
            .map(VendorResponseDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    @Override
    public VendorResponseDTO updateVendor(Long id, VendorRequestDTO vendorRequestDTO) {
        Vendor existingVendor = vendorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", id));
        
        if (!existingVendor.getName().equals(vendorRequestDTO.getName()) && 
            vendorRepository.findByName(vendorRequestDTO.getName()).isPresent()) {
            throw new DuplicateResourceException("Vendor", "name", vendorRequestDTO.getName());
        }
        
        if (vendorRequestDTO.getEmail() != null && 
            !vendorRequestDTO.getEmail().equals(existingVendor.getEmail()) && 
            vendorRepository.findByEmail(vendorRequestDTO.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Vendor", "email", vendorRequestDTO.getEmail());
        }
        
        existingVendor.setName(vendorRequestDTO.getName());
        existingVendor.setContactPerson(vendorRequestDTO.getContactPerson());
        existingVendor.setEmail(vendorRequestDTO.getEmail());
        existingVendor.setPhoneNumber(vendorRequestDTO.getPhoneNumber());
        existingVendor.setAddress(vendorRequestDTO.getAddress());
        
        Vendor updatedVendor = vendorRepository.save(existingVendor);
        return VendorResponseDTO.fromEntity(updatedVendor);
    }
    
    @Override
    public void deleteVendor(Long id) {
        vendorRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<VendorResponseDTO> getActiveVendors(Pageable pageable) {
        return vendorRepository.findAll(pageable)
            .map(VendorResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<VendorResponseDTO> searchVendors(String name, String email, String phone, String status, Pageable pageable) {
        Specification<Vendor> spec = Specification.where(null);
        
        // Check if this is a global search (same term in multiple fields)
        boolean isGlobalSearch = name != null && name.equals(email) && name.equals(phone);
        
        if (isGlobalSearch) {
            spec = spec.and(hasGlobalSearch(name));
        } else {
            // Individual field searches
            spec = spec.and(hasNameLike(name))
                .and(hasEmailLike(email))
                .and(hasPhoneLike(phone));
        }
        
        spec = spec.and(hasStatus(status));
        return vendorRepository.findAll(spec, pageable).map(VendorResponseDTO::fromEntity);
    }
}