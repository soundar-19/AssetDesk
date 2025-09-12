package com.assetdesk.controller;

import com.assetdesk.dto.vendor.VendorRequestDTO;
import com.assetdesk.dto.vendor.VendorResponseDTO;
import com.assetdesk.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VendorController {
    
    private final VendorService vendorService;
    
    @PostMapping
    public ResponseEntity<VendorResponseDTO> createVendor(@Valid @RequestBody VendorRequestDTO vendorRequestDTO) {
        VendorResponseDTO createdVendor = vendorService.createVendor(vendorRequestDTO);
        return new ResponseEntity<>(createdVendor, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<VendorResponseDTO> getVendorById(@PathVariable Long id) {
        VendorResponseDTO vendor = vendorService.getVendorById(id);
        return ResponseEntity.ok(vendor);
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<VendorResponseDTO> getVendorByName(@PathVariable String name) {
        VendorResponseDTO vendor = vendorService.getVendorByName(name);
        return ResponseEntity.ok(vendor);
    }
    
    @GetMapping
    public ResponseEntity<Page<VendorResponseDTO>> getAllVendors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        Pageable pageable = PageRequest.of(page, size,
            sortBy != null ? org.springframework.data.domain.Sort.by(
                "desc".equalsIgnoreCase(sortDir) ? 
                org.springframework.data.domain.Sort.Direction.DESC : 
                org.springframework.data.domain.Sort.Direction.ASC, sortBy) : 
            org.springframework.data.domain.Sort.unsorted());
        Page<VendorResponseDTO> vendors = vendorService.getAllVendors(pageable);
        return ResponseEntity.ok(vendors);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<VendorResponseDTO>> getAllVendorsList() {
        List<VendorResponseDTO> vendors = vendorService.getAllVendors();
        return ResponseEntity.ok(vendors);
    }
    
    @GetMapping("/active")
    public ResponseEntity<Page<VendorResponseDTO>> getActiveVendors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VendorResponseDTO> vendors = vendorService.getActiveVendors(pageable);
        return ResponseEntity.ok(vendors);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<VendorResponseDTO>> searchVendors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size,
            sortBy != null ? org.springframework.data.domain.Sort.by(
                "desc".equalsIgnoreCase(sortDir) ? 
                org.springframework.data.domain.Sort.Direction.DESC : 
                org.springframework.data.domain.Sort.Direction.ASC, sortBy) : 
            org.springframework.data.domain.Sort.unsorted());
        Page<VendorResponseDTO> vendors = vendorService.searchVendors(name, email, phone, status, pageable);
        return ResponseEntity.ok(vendors);
    }
    
    @GetMapping("/search/name")
    public ResponseEntity<List<VendorResponseDTO>> searchVendorsByName(@RequestParam String name) {
        List<VendorResponseDTO> vendors = vendorService.searchVendorsByName(name);
        return ResponseEntity.ok(vendors);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<VendorResponseDTO> updateVendor(@PathVariable Long id, @Valid @RequestBody VendorRequestDTO vendorRequestDTO) {
        VendorResponseDTO updatedVendor = vendorService.updateVendor(id, vendorRequestDTO);
        return ResponseEntity.ok(updatedVendor);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }
}