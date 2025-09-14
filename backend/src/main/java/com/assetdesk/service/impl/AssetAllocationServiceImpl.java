package com.assetdesk.service.impl;

import com.assetdesk.domain.Asset;
import com.assetdesk.domain.AssetAllocation;
import com.assetdesk.repository.AssetAllocationRepository;
import com.assetdesk.repository.AssetRepository;
import com.assetdesk.repository.UserRepository;
import com.assetdesk.repository.ServiceRecordRepository;
import com.assetdesk.service.AssetAllocationService;
import com.assetdesk.service.NotificationService;
import com.assetdesk.domain.ServiceRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import com.assetdesk.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetAllocationServiceImpl implements AssetAllocationService {
    
    private final AssetAllocationRepository assetAllocationRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ServiceRecordRepository serviceRecordRepository;
    
    @Override
    public AssetAllocation allocateAsset(Long assetId, Long userId, LocalDate allocatedDate, String remarks) {
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", assetId));
        
        // Change asset status to ALLOCATED
        asset.setStatus(Asset.Status.ALLOCATED);
        assetRepository.save(asset);
        
        AssetAllocation allocation = new AssetAllocation();
        allocation.setAsset(asset);
        allocation.setUser(userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId)));
        allocation.setAllocatedDate(allocatedDate);
        allocation.setRemarks(remarks);
        
        AssetAllocation savedAllocation = assetAllocationRepository.save(allocation);
        
        // Create service record for allocation
        try {
            ServiceRecord serviceRecord = new ServiceRecord();
            serviceRecord.setAsset(asset);
            serviceRecord.setServiceDate(allocatedDate);
            serviceRecord.setServiceDescription("Asset allocated to " + allocation.getUser().getName() + 
                (remarks != null ? ". Remarks: " + remarks : ""));
            serviceRecordRepository.save(serviceRecord);
        } catch (Exception e) {
            System.out.println("Failed to create service record: " + e.getMessage());
        }
        
        // Create notification for asset allocation
        try {
            notificationService.createNotification(
                userId,
                "Asset Allocated",
                "Asset '" + asset.getName() + "' has been allocated to you",
                com.assetdesk.domain.Notification.Type.INFO,
                null,
                asset.getId()
            );
        } catch (Exception e) {
            System.out.println("Failed to create allocation notification: " + e.getMessage());
        }
        
        return savedAllocation;
    }
    
    @Override
    public AssetAllocation returnAsset(Long assetId, LocalDate returnedDate, String remarks) {
        AssetAllocation currentAllocation = assetAllocationRepository.findCurrentAllocationByAssetId(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Current allocation not found for asset", "assetId", assetId));
        
        // Change asset status back to AVAILABLE
        Asset asset = currentAllocation.getAsset();
        asset.setStatus(Asset.Status.AVAILABLE);
        assetRepository.save(asset);
        
        currentAllocation.setReturnedDate(returnedDate);
        String existingRemarks = currentAllocation.getRemarks() != null ? currentAllocation.getRemarks() : "";
        currentAllocation.setRemarks(existingRemarks + " | Return: " + remarks);
        
        AssetAllocation savedAllocation = assetAllocationRepository.save(currentAllocation);
        
        // Create service record for return
        try {
            ServiceRecord serviceRecord = new ServiceRecord();
            serviceRecord.setAsset(asset);
            serviceRecord.setServiceDate(returnedDate);
            serviceRecord.setServiceDescription("Asset returned by " + currentAllocation.getUser().getName() + 
                (remarks != null ? ". Remarks: " + remarks : ""));
            serviceRecordRepository.save(serviceRecord);
        } catch (Exception e) {
            System.out.println("Failed to create service record: " + e.getMessage());
        }
        
        // Create notification for asset return
        try {
            if (currentAllocation.getUser() != null) {
                notificationService.createNotification(
                    currentAllocation.getUser().getId(),
                    "Asset Returned",
                    "Asset '" + asset.getName() + "' has been returned successfully",
                    com.assetdesk.domain.Notification.Type.SUCCESS,
                    null,
                    asset.getId()
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to create return notification: " + e.getMessage());
        }
        
        return savedAllocation;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssetAllocation> getAllocationHistory(Long assetId) {
        return assetAllocationRepository.findByAssetId(assetId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssetAllocation> getUserAllocations(Long userId) {
        return assetAllocationRepository.findByUserId(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetAllocation> getAllAllocations(Pageable pageable) {
        return assetAllocationRepository.findAll(pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetAllocation> getAllAllocations(Pageable pageable, String status, String search) {
        if ("ACTIVE".equals(status)) {
            return assetAllocationRepository.findByReturnedDateIsNull(pageable);
        } else if ("RETURNED".equals(status)) {
            return assetAllocationRepository.findByReturnedDateIsNotNull(pageable);
        }
        return assetAllocationRepository.findAll(pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Object getAnalytics() {
        long totalAllocations = assetAllocationRepository.count();
        long activeAllocations = assetAllocationRepository.countByReturnedDateIsNull();
        long returnedAllocations = totalAllocations - activeAllocations;
        
        return java.util.Map.of(
            "totalAllocations", totalAllocations,
            "activeAllocations", activeAllocations,
            "returnedAllocations", returnedAllocations,
            "utilizationRate", totalAllocations > 0 ? (double) activeAllocations / totalAllocations * 100 : 0
        );
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssetAllocation> getCurrentAllocations() {
        return assetAllocationRepository.findCurrentAllocations();
    }
    
    @Override
    @Transactional(readOnly = true)
    public AssetAllocation getCurrentAllocation(Long assetId) {
        return assetAllocationRepository.findCurrentAllocationByAssetId(assetId)
            .orElse(null);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetAllocation> getActiveAllocations(Pageable pageable) {
        return assetAllocationRepository.findByReturnedDateIsNull(pageable);
    }
    
    @Override
    public AssetAllocation requestReturn(Long assetId, String remarks) {
        AssetAllocation currentAllocation = assetAllocationRepository.findCurrentAllocationByAssetId(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Current allocation not found for asset", "assetId", assetId));
        
        currentAllocation.setReturnRequestDate(LocalDate.now());
        currentAllocation.setReturnRequestRemarks(remarks);
        
        AssetAllocation savedAllocation = assetAllocationRepository.save(currentAllocation);
        
        // Send notification to user about return request
        try {
            notificationService.createNotification(
                currentAllocation.getUser().getId(),
                "Asset Return Requested",
                "Please return asset '" + currentAllocation.getAsset().getName() + "' at your earliest convenience." + 
                (remarks != null ? " Reason: " + remarks : ""),
                com.assetdesk.domain.Notification.Type.WARNING,
                null,
                currentAllocation.getAsset().getId()
            );
        } catch (Exception e) {
            System.out.println("Failed to create return request notification: " + e.getMessage());
        }
        
        return savedAllocation;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssetAllocation> getUserAllocationsWithHistory(Long userId) {
        return assetAllocationRepository.findByUserId(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssetAllocation> getAssetAllocationsWithHistory(Long assetId) {
        return assetAllocationRepository.findByAssetId(assetId);
    }
}