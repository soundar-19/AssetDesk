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
import com.assetdesk.exception.InvalidOperationException;
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
        
        // Handle shareable assets (software licenses)
        if (Boolean.TRUE.equals(asset.getIsShareable())) {
            // Check if licenses are available
            int usedLicenses = asset.getUsedLicenses() != null ? asset.getUsedLicenses() : 0;
            int totalLicenses = asset.getTotalLicenses() != null ? asset.getTotalLicenses() : 1;
            
            // Check if user already has this asset allocated
            boolean userAlreadyHasAsset = assetAllocationRepository.findByAssetIdAndUserIdAndReturnedDateIsNull(assetId, userId).isPresent();
            if (userAlreadyHasAsset) {
                throw new InvalidOperationException("User already has this asset allocated.");
            }
            
            if (usedLicenses >= totalLicenses) {
                throw new InvalidOperationException("No available licenses. All " + totalLicenses + " licenses are in use.");
            }
            
            // Increment used licenses
            asset.setUsedLicenses(usedLicenses + 1);
            
            // Update status based on license availability
            if (asset.getUsedLicenses() >= totalLicenses) {
                asset.setStatus(Asset.Status.ALLOCATED);
            } else {
                asset.setStatus(Asset.Status.AVAILABLE); // Still available for more users
            }
            assetRepository.save(asset);
        } else {
            // Check if asset is already allocated (for non-shareable assets)
            if (asset.getStatus() == Asset.Status.ALLOCATED) {
                throw new InvalidOperationException("Asset is already allocated to another user.");
            }
            
            // Only change status for non-shareable assets (hardware)
            asset.setStatus(Asset.Status.ALLOCATED);
            assetRepository.save(asset);
        }
        
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
    public AssetAllocation returnAssetFromUser(Long assetId, Long userId, LocalDate returnedDate, String remarks) {
        // Find the specific allocation for this user and asset
        AssetAllocation allocation = assetAllocationRepository.findByAssetIdAndUserIdAndReturnedDateIsNull(assetId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Active allocation not found for asset and user", "assetId/userId", assetId + "/" + userId));
        
        allocation.setReturnedDate(returnedDate);
        allocation.setReturnStatus(AssetAllocation.ReturnStatus.COMPLETED);
        String existingRemarks = allocation.getRemarks() != null ? allocation.getRemarks() : "";
        allocation.setRemarks(existingRemarks + " | Return: " + remarks);
        
        AssetAllocation savedAllocation = assetAllocationRepository.save(allocation);
        
        // Update asset license count for shareable assets
        Asset asset = allocation.getAsset();
        if (Boolean.TRUE.equals(asset.getIsShareable()) || asset.getCategory() == Asset.Category.SOFTWARE) {
            if (asset.getUsedLicenses() != null && asset.getUsedLicenses() > 0) {
                asset.setUsedLicenses(asset.getUsedLicenses() - 1);
                
                // Update status based on license availability
                if (asset.getUsedLicenses() == 0) {
                    asset.setStatus(Asset.Status.AVAILABLE);
                } else {
                    asset.setStatus(Asset.Status.AVAILABLE); // Still available for more users
                }
                assetRepository.save(asset);
            }
        }
        
        return savedAllocation;
    }
    
    @Override
    public AssetAllocation returnAsset(Long assetId, LocalDate returnedDate, String remarks) {
        AssetAllocation currentAllocation = assetAllocationRepository.findCurrentAllocationByAssetId(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Current allocation not found for asset", "assetId", assetId));
        
        Asset asset = currentAllocation.getAsset();
        
        // Handle shareable assets (software licenses)
        if (Boolean.TRUE.equals(asset.getIsShareable())) {
            // Decrement used licenses
            int usedLicenses = asset.getUsedLicenses() != null ? asset.getUsedLicenses() : 0;
            if (usedLicenses > 0) {
                asset.setUsedLicenses(usedLicenses - 1);
            }
            
            // Update status based on license availability
            if (asset.getUsedLicenses() > 0) {
                asset.setStatus(Asset.Status.ALLOCATED); // Still has users
            } else {
                asset.setStatus(Asset.Status.AVAILABLE); // No users left
            }
            assetRepository.save(asset);
        } else {
            // Only change status for non-shareable assets (hardware)
            asset.setStatus(Asset.Status.AVAILABLE);
            assetRepository.save(asset);
        }
        
        currentAllocation.setReturnedDate(returnedDate);
        currentAllocation.setReturnStatus(AssetAllocation.ReturnStatus.COMPLETED);
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
        
        // Notify IT_SUPPORT about asset return
        try {
            List<com.assetdesk.domain.User> itUsers = userRepository.findByRole(com.assetdesk.domain.User.Role.IT_SUPPORT);
            for (com.assetdesk.domain.User itUser : itUsers) {
                notificationService.createNotification(
                    itUser.getId(),
                    "Asset Returned",
                    "Asset '" + asset.getName() + "' has been returned by " + currentAllocation.getUser().getName(),
                    com.assetdesk.domain.Notification.Type.SUCCESS,
                    null,
                    asset.getId()
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to create IT return notification: " + e.getMessage());
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
        List<AssetAllocation> currentAllocations = assetAllocationRepository.findCurrentAllocationsByAssetId(assetId);
        return currentAllocations.isEmpty() ? null : currentAllocations.get(0);
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
        currentAllocation.setReturnStatus(AssetAllocation.ReturnStatus.REQUESTED);
        
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
    
    @Override
    public AssetAllocation acknowledgeReturnRequest(Long assetId, Long userId) {
        AssetAllocation allocation = assetAllocationRepository.findCurrentAllocationByAssetId(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Current allocation not found for asset", "assetId", assetId));
        
        if (!allocation.getUser().getId().equals(userId)) {
            throw new InvalidOperationException("User can only acknowledge their own return requests");
        }
        
        if (allocation.getReturnStatus() != AssetAllocation.ReturnStatus.REQUESTED) {
            throw new InvalidOperationException("No pending return request found");
        }
        
        allocation.setReturnStatus(AssetAllocation.ReturnStatus.ACKNOWLEDGED);
        AssetAllocation savedAllocation = assetAllocationRepository.save(allocation);
        
        // Notify IT_SUPPORT that user acknowledged return request
        try {
            List<com.assetdesk.domain.User> itUsers = userRepository.findByRole(com.assetdesk.domain.User.Role.IT_SUPPORT);
            for (com.assetdesk.domain.User itUser : itUsers) {
                notificationService.createNotification(
                    itUser.getId(),
                    "Return Request Acknowledged",
                    "User " + allocation.getUser().getName() + " acknowledged return request for asset '" + allocation.getAsset().getName() + "'",
                    com.assetdesk.domain.Notification.Type.INFO,
                    null,
                    allocation.getAsset().getId()
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to create IT notification: " + e.getMessage());
        }
        
        return savedAllocation;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssetAllocation> getUserReturnRequests(Long userId) {
        return assetAllocationRepository.findByUserIdAndReturnStatusIn(userId, 
            java.util.Arrays.asList(AssetAllocation.ReturnStatus.REQUESTED, AssetAllocation.ReturnStatus.ACKNOWLEDGED));
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssetAllocation> getPendingReturns() {
        return assetAllocationRepository.findByReturnStatusIn(
            java.util.Arrays.asList(AssetAllocation.ReturnStatus.REQUESTED, AssetAllocation.ReturnStatus.ACKNOWLEDGED));
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Long> getAllocatedUserIds(Long assetId) {
        return assetAllocationRepository.findCurrentAllocationsByAssetId(assetId)
            .stream()
            .map(allocation -> allocation.getUser().getId())
            .collect(Collectors.toList());
    }
}