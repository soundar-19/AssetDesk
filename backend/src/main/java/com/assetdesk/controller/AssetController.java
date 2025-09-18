package com.assetdesk.controller;

import com.assetdesk.dto.asset.AssetRequestDTO;
import com.assetdesk.dto.asset.AssetResponseDTO;
import com.assetdesk.dto.asset.AssetGroupResponseDTO;
import com.assetdesk.dto.asset.WarrantyStatsDTO;
import com.assetdesk.dto.AssetAllocationResponseDTO;
import com.assetdesk.service.AssetService;
import com.assetdesk.service.AssetAllocationService;
import com.assetdesk.service.DepreciationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {
    
    private final AssetService assetService;
    private final AssetAllocationService allocationService;
    private final DepreciationService depreciationService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetResponseDTO> createAsset(@Valid @RequestBody AssetRequestDTO assetRequestDTO) {
        AssetResponseDTO createdAsset = assetService.createAsset(assetRequestDTO);
        return new ResponseEntity<>(createdAsset, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> getAssetById(@PathVariable Long id) {
        AssetResponseDTO asset = assetService.getAssetById(id);
        return ResponseEntity.ok(asset);
    }
    
    @GetMapping("/tag/{assetTag}")
    public ResponseEntity<AssetResponseDTO> getAssetByTag(@PathVariable String assetTag) {
        AssetResponseDTO asset = assetService.getAssetByTag(assetTag);
        return ResponseEntity.ok(asset);
    }
    
    @GetMapping
    public ResponseEntity<Page<AssetResponseDTO>> getAllAssets(
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
        Page<AssetResponseDTO> assets = assetService.getAllAssets(pageable);
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AssetResponseDTO>> searchAssets(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assetTag,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String serialNumber,
            @RequestParam(required = false) String vendor,
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
        Page<AssetResponseDTO> assets = assetService.searchAdvanced(name, category, type, status, 
            assetTag, model, serialNumber, vendor, pageable);
        return ResponseEntity.ok(assets);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<AssetResponseDTO>> getAssetsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AssetResponseDTO> assets = assetService.getAssetsByCategory(category, pageable);
        return ResponseEntity.ok(assets);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<AssetResponseDTO>> getAssetsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AssetResponseDTO> assets = assetService.getAssetsByStatus(status, pageable);
        return ResponseEntity.ok(assets);
    }
    
    @GetMapping("/available")
    public ResponseEntity<Page<AssetResponseDTO>> getAvailableAssets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AssetResponseDTO> assets = assetService.getAvailableAssets(pageable);
        return ResponseEntity.ok(assets);
    }
    
    @GetMapping("/groups")
    public ResponseEntity<List<AssetGroupResponseDTO>> getAssetGroups() {
        List<AssetGroupResponseDTO> groups = assetService.getAssetGroups();
        return ResponseEntity.ok(groups);
    }
    
    @GetMapping("/by-name/{name}")
    public ResponseEntity<Page<AssetResponseDTO>> getAssetsByName(
            @PathVariable String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AssetResponseDTO> assets = assetService.getAssetsByName(name, pageable);
        return ResponseEntity.ok(assets);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetResponseDTO> updateAsset(@PathVariable Long id, @Valid @RequestBody AssetRequestDTO assetRequestDTO) {
        AssetResponseDTO updatedAsset = assetService.updateAsset(id, assetRequestDTO);
        return ResponseEntity.ok(updatedAsset);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{assetId}/allocate/{userId}")
    public ResponseEntity<AssetResponseDTO> allocateAsset(@PathVariable Long assetId, @PathVariable Long userId, @RequestParam(required = false) String remarks) {
        AssetResponseDTO allocatedAsset = assetService.allocateAsset(assetId, userId, remarks);
        return ResponseEntity.ok(allocatedAsset);
    }
    
    @PostMapping("/{assetId}/allocate-by-employee/{employeeId}")
    public ResponseEntity<AssetResponseDTO> allocateAssetByEmployeeId(@PathVariable Long assetId, @PathVariable String employeeId, @RequestParam(required = false) String remarks) {
        AssetResponseDTO allocatedAsset = assetService.allocateAssetByEmployeeId(assetId, employeeId, remarks);
        return ResponseEntity.ok(allocatedAsset);
    }
    
    @PostMapping("/{assetId}/return")
    public ResponseEntity<AssetResponseDTO> returnAsset(@PathVariable Long assetId, @RequestParam(required = false) String remarks) {
        AssetResponseDTO returnedAsset = assetService.returnAsset(assetId, remarks);
        return ResponseEntity.ok(returnedAsset);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<AssetResponseDTO>> getAssetsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AssetResponseDTO> assets = assetService.getAssetsByUser(userId, pageable);
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/{assetId}/depreciation")
    public ResponseEntity<Map<String, Object>> getDepreciation(
            @PathVariable Long assetId,
            @RequestParam(required = false) String asOfDate) {
        Map<String, Object> data = depreciationService.getDepreciation(
                assetId,
                asOfDate != null ? java.time.LocalDate.parse(asOfDate) : null
        );
        return ResponseEntity.ok(data);
    }

    @GetMapping("/warranty/expiring")
    public ResponseEntity<Page<AssetResponseDTO>> getWarrantyExpiring(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AssetResponseDTO> assets = assetService.getWarrantyExpiring(days, pageable);
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/group/summary")
    public ResponseEntity<Map<String, Object>> getGroupSummary(@RequestParam String name) {
        var dto = assetService.getGroupSummary(name);
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("name", dto.getName());
        map.put("total", dto.getTotal());
        map.put("available", dto.getAvailable());
        map.put("allocated", dto.getAllocated());
        map.put("maintenance", dto.getMaintenance());
        map.put("retired", dto.getRetired());
        map.put("lost", dto.getLost());
        map.put("allocatedUsers", dto.getAllocatedUsers());
        return ResponseEntity.ok(map);
    }

    @PostMapping("/group/allocate")
    public ResponseEntity<AssetResponseDTO> allocateFromGroup(@RequestParam String name, @RequestParam Long userId, @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(assetService.allocateFromGroup(name, userId, remarks));
    }
    
    @PostMapping("/group/allocate-by-employee")
    public ResponseEntity<AssetResponseDTO> allocateFromGroupByEmployeeId(@RequestParam String name, @RequestParam String employeeId, @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(assetService.allocateFromGroupByEmployeeId(name, employeeId, remarks));
    }
    
    @GetMapping("/warranty/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarrantyStatsDTO> getWarrantyStats() {
        WarrantyStatsDTO stats = assetService.getWarrantyStats();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/warranty/expired")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AssetResponseDTO>> getExpiredWarranties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AssetResponseDTO> assets = assetService.getExpiredWarranties(pageable);
        return ResponseEntity.ok(assets);
    }
    
    @GetMapping("/warranty/valid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AssetResponseDTO>> getValidWarranties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AssetResponseDTO> assets = assetService.getValidWarranties(pageable);
        return ResponseEntity.ok(assets);
    }
    
    // Allocation-related endpoints
    @GetMapping("/{assetId}/allocations")
    public ResponseEntity<List<AssetAllocationResponseDTO>> getAssetAllocationHistory(@PathVariable Long assetId) {
        var allocations = allocationService.getAllocationHistory(assetId);
        var dtos = allocations.stream().map(AssetAllocationResponseDTO::fromEntity).toList();
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/allocations/analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('IT_SUPPORT')")
    public ResponseEntity<Map<String, Object>> getAllocationAnalytics() {
        return ResponseEntity.ok((Map<String, Object>) allocationService.getAnalytics());
    }
    
    @PostMapping("/bulk/return")
    @PreAuthorize("hasRole('ADMIN') or hasRole('IT_SUPPORT')")
    public ResponseEntity<Map<String, Object>> bulkReturnAssets(
            @RequestBody List<Long> assetIds,
            @RequestParam(required = false) String remarks) {
        int successCount = 0;
        int failureCount = 0;
        
        for (Long assetId : assetIds) {
            try {
                assetService.returnAsset(assetId, remarks);
                successCount++;
            } catch (Exception e) {
                failureCount++;
            }
        }
        
        Map<String, Object> result = Map.of(
            "total", assetIds.size(),
            "success", successCount,
            "failures", failureCount
        );
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getFilteredAssetCount(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) String costMin,
            @RequestParam(required = false) String costMax) {
        
        long count = assetService.getFilteredCount(category, type, status, dateFrom, dateTo, costMin, costMax);
        return ResponseEntity.ok(count);
    }
    
    @PostMapping("/{id}/retire")
    @PreAuthorize("hasRole('ADMIN') or hasRole('IT_SUPPORT')")
    public ResponseEntity<AssetResponseDTO> retireAsset(@PathVariable Long id, @RequestParam(required = false) String remarks) {
        AssetResponseDTO retiredAsset = assetService.retireAsset(id, remarks);
        return ResponseEntity.ok(retiredAsset);
    }
}