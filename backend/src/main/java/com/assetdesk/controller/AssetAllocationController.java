package com.assetdesk.controller;

import com.assetdesk.domain.AssetAllocation;
import com.assetdesk.dto.AssetAllocationResponseDTO;
import com.assetdesk.service.AssetAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/allocations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssetAllocationController {
    
    private final AssetAllocationService assetAllocationService;
    
    @PostMapping("/allocate")
    public ResponseEntity<AssetAllocationResponseDTO> allocateAsset(@RequestParam Long assetId, @RequestParam Long userId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate allocatedDate, @RequestParam(required = false) String remarks) {
        AssetAllocation allocation = assetAllocationService.allocateAsset(assetId, userId, allocatedDate, remarks);
        return new ResponseEntity<>(AssetAllocationResponseDTO.fromEntity(allocation), HttpStatus.CREATED);
    }
    
    @PostMapping("/return")
    public ResponseEntity<AssetAllocationResponseDTO> returnAsset(@RequestParam Long assetId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnedDate, @RequestParam(required = false) String remarks) {
        AssetAllocation allocation = assetAllocationService.returnAsset(assetId, returnedDate, remarks);
        return ResponseEntity.ok(AssetAllocationResponseDTO.fromEntity(allocation));
    }
    
    @PostMapping("/return-from-user")
    public ResponseEntity<AssetAllocationResponseDTO> returnAssetFromUser(@RequestParam Long assetId, @RequestParam Long userId, @RequestParam(required = false) String remarks) {
        AssetAllocation allocation = assetAllocationService.returnAssetFromUser(assetId, userId, LocalDate.now(), remarks);
        return ResponseEntity.ok(AssetAllocationResponseDTO.fromEntity(allocation));
    }
    
    @GetMapping("/asset/{assetId}/history")
    public ResponseEntity<List<AssetAllocation>> getAllocationHistory(@PathVariable Long assetId) {
        List<AssetAllocation> history = assetAllocationService.getAllocationHistory(assetId);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AssetAllocation>> getUserAllocations(@PathVariable Long userId) {
        List<AssetAllocation> allocations = assetAllocationService.getUserAllocations(userId);
        return ResponseEntity.ok(allocations);
    }
    
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<List<AssetAllocationResponseDTO>> getUserAllocationHistory(@PathVariable Long userId) {
        List<AssetAllocation> allocations = assetAllocationService.getUserAllocationsWithHistory(userId);
        List<AssetAllocationResponseDTO> dtos = allocations.stream().map(AssetAllocationResponseDTO::fromEntity).toList();
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping
    public ResponseEntity<Page<AssetAllocationResponseDTO>> getAllAllocations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AssetAllocation> allocations = assetAllocationService.getAllAllocations(pageable, status, search);
            Page<AssetAllocationResponseDTO> dtoPage = allocations.map(AssetAllocationResponseDTO::fromEntity);
            return ResponseEntity.ok(dtoPage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch allocations: " + e.getMessage());
        }
    }
    
    @GetMapping("/analytics")
    public ResponseEntity<Object> getAllocationAnalytics() {
        try {
            return ResponseEntity.ok(assetAllocationService.getAnalytics());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch analytics: " + e.getMessage());
        }
    }
    
    @GetMapping("/current")
    public ResponseEntity<List<AssetAllocation>> getCurrentAllocations() {
        List<AssetAllocation> allocations = assetAllocationService.getCurrentAllocations();
        return ResponseEntity.ok(allocations);
    }
    
    @GetMapping("/active")
    public ResponseEntity<Page<AssetAllocationResponseDTO>> getActiveAllocations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AssetAllocation> allocations = assetAllocationService.getActiveAllocations(pageable);
        Page<AssetAllocationResponseDTO> dtoPage = allocations.map(AssetAllocationResponseDTO::fromEntity);
        return ResponseEntity.ok(dtoPage);
    }
    
    @GetMapping("/asset/{assetId}/current")
    public ResponseEntity<AssetAllocationResponseDTO> getCurrentAllocation(@PathVariable Long assetId) {
        AssetAllocation allocation = assetAllocationService.getCurrentAllocation(assetId);
        if (allocation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(AssetAllocationResponseDTO.fromEntity(allocation));
    }
    
    @PostMapping("/request-return/{assetId}")
    public ResponseEntity<AssetAllocationResponseDTO> requestReturn(@PathVariable Long assetId, @RequestParam(required = false) String remarks) {
        AssetAllocation allocation = assetAllocationService.requestReturn(assetId, remarks);
        return ResponseEntity.ok(AssetAllocationResponseDTO.fromEntity(allocation));
    }
    
    @PostMapping("/acknowledge-return/{assetId}")
    public ResponseEntity<AssetAllocationResponseDTO> acknowledgeReturnRequest(@PathVariable Long assetId, @RequestParam Long userId) {
        AssetAllocation allocation = assetAllocationService.acknowledgeReturnRequest(assetId, userId);
        return ResponseEntity.ok(AssetAllocationResponseDTO.fromEntity(allocation));
    }
    
    @GetMapping("/user/{userId}/return-requests")
    public ResponseEntity<List<AssetAllocationResponseDTO>> getUserReturnRequests(@PathVariable Long userId) {
        List<AssetAllocation> requests = assetAllocationService.getUserReturnRequests(userId);
        List<AssetAllocationResponseDTO> dtos = requests.stream().map(AssetAllocationResponseDTO::fromEntity).toList();
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/pending-returns")
    public ResponseEntity<List<AssetAllocationResponseDTO>> getPendingReturns() {
        List<AssetAllocation> pending = assetAllocationService.getPendingReturns();
        List<AssetAllocationResponseDTO> dtos = pending.stream().map(AssetAllocationResponseDTO::fromEntity).toList();
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/asset/{assetId}/allocated-users")
    public ResponseEntity<List<Long>> getAllocatedUserIds(@PathVariable Long assetId) {
        List<Long> allocatedUserIds = assetAllocationService.getAllocatedUserIds(assetId);
        return ResponseEntity.ok(allocatedUserIds);
    }
}