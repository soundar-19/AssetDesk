package com.assetdesk.service.impl;

import com.assetdesk.dto.asset.AssetRequestDTO;
import com.assetdesk.dto.asset.AssetResponseDTO;
import com.assetdesk.dto.asset.AssetGroupResponseDTO;
import com.assetdesk.domain.Asset;
import com.assetdesk.domain.AssetAllocation;
import com.assetdesk.domain.User;
import com.assetdesk.repository.AssetRepository;
import com.assetdesk.repository.AssetAllocationRepository;
import com.assetdesk.repository.UserRepository;
import com.assetdesk.repository.VendorRepository;
import com.assetdesk.service.AssetService;
import com.assetdesk.service.AssetAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import com.assetdesk.exception.ResourceNotFoundException;
import com.assetdesk.exception.DuplicateResourceException;
import com.assetdesk.exception.AssetNotAvailableException;
import com.assetdesk.exception.InvalidOperationException;
import org.springframework.data.jpa.domain.Specification;
import static com.assetdesk.spec.AssetSpecifications.*;
import com.assetdesk.dto.asset.AssetGroupSummaryDTO;
import com.assetdesk.dto.asset.WarrantyStatsDTO;
import com.assetdesk.domain.AssetAllocation;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetServiceImpl implements AssetService {
    
    private final AssetRepository assetRepository;
    private final AssetAllocationRepository allocationRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final AssetAllocationService assetAllocationService;
    private final com.assetdesk.service.WarrantyHistoryService warrantyHistoryService;
    private final com.assetdesk.service.NotificationService notificationService;
    
    @Override
    public AssetResponseDTO createAsset(AssetRequestDTO assetRequestDTO) {
        if (assetRepository.findByAssetTag(assetRequestDTO.getAssetTag()).isPresent()) {
            throw new DuplicateResourceException("Asset", "assetTag", assetRequestDTO.getAssetTag());
        }
        
        Asset asset = assetRequestDTO.toEntity();
        
        // Set default status to AVAILABLE if not specified
        if (asset.getStatus() == null) {
            asset.setStatus(Asset.Status.AVAILABLE);
        }
        
        // Automatically set isShareable to true for software assets
        if (asset.getCategory() == Asset.Category.SOFTWARE) {
            asset.setIsShareable(true);
            // Set default values for license fields if not provided
            if (asset.getTotalLicenses() == null) {
                asset.setTotalLicenses(1);
            }
            if (asset.getUsedLicenses() == null) {
                asset.setUsedLicenses(0);
            }
        }
        
        if (assetRequestDTO.getVendorId() != null) {
            asset.setVendor(vendorRepository.findById(assetRequestDTO.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", assetRequestDTO.getVendorId())));
        }
        
        Asset savedAsset = assetRepository.save(asset);
        if (savedAsset.getWarrantyExpiryDate() != null) {
            warrantyHistoryService.record(savedAsset, null, savedAsset.getWarrantyExpiryDate(), "Initial creation");
            
            // Check if warranty is expiring soon and notify IT support
            LocalDate expiryDate = savedAsset.getWarrantyExpiryDate();
            LocalDate now = LocalDate.now();
            long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(now, expiryDate);
            
            if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                try {
                    List<com.assetdesk.domain.User> itUsers = userRepository.findByRole(com.assetdesk.domain.User.Role.IT_SUPPORT);
                    for (com.assetdesk.domain.User itUser : itUsers) {
                        notificationService.createNotification(
                            itUser.getId(),
                            "Warranty Expiring Soon",
                            "Asset '" + savedAsset.getName() + "' warranty expires in " + daysUntilExpiry + " days",
                            com.assetdesk.domain.Notification.Type.WARNING,
                            null,
                            savedAsset.getId()
                        );
                    }
                } catch (Exception e) {
                    System.out.println("Failed to create warranty expiry notification: " + e.getMessage());
                }
            }
        }
        
        // Notify IT support about new asset creation
        try {
            List<com.assetdesk.domain.User> itUsers = userRepository.findByRole(com.assetdesk.domain.User.Role.IT_SUPPORT);
            for (com.assetdesk.domain.User itUser : itUsers) {
                notificationService.createNotification(
                    itUser.getId(),
                    "New Asset Created",
                    "New asset '" + savedAsset.getName() + "' has been added to inventory",
                    com.assetdesk.domain.Notification.Type.INFO,
                    null,
                    savedAsset.getId()
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to create asset creation notification: " + e.getMessage());
        }
        
        return AssetResponseDTO.fromEntity(savedAsset);
    }
    
    @Override
    @Transactional(readOnly = true)
    public AssetResponseDTO getAssetById(Long id) {
        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", id));
        return AssetResponseDTO.fromEntity(asset);
    }
    
    @Override
    @Transactional(readOnly = true)
    public AssetResponseDTO getAssetByTag(String assetTag) {
        Asset asset = assetRepository.findByAssetTag(assetTag)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "tag", assetTag));
        return AssetResponseDTO.fromEntity(asset);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> getAllAssets(Pageable pageable) {
        return assetRepository.findAll(pageable)
            .map(asset -> {
                AssetAllocation currentAllocation = allocationRepository.findCurrentAllocationByAssetId(asset.getId()).orElse(null);
                return AssetResponseDTO.fromEntityWithAllocation(asset, currentAllocation);
            });
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> getAssetsByCategory(String category, Pageable pageable) {
        Asset.Category assetCategory = Asset.Category.valueOf(category.toUpperCase(Locale.ROOT));
        return assetRepository.findByCategory(assetCategory, pageable)
            .map(asset -> {
                AssetAllocation currentAllocation = allocationRepository.findCurrentAllocationByAssetId(asset.getId()).orElse(null);
                return AssetResponseDTO.fromEntityWithAllocation(asset, currentAllocation);
            });
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> getAssetsByStatus(String status, Pageable pageable) {
        Asset.Status assetStatus = Asset.Status.valueOf(status.toUpperCase(Locale.ROOT));
        return assetRepository.findByStatus(assetStatus, pageable)
            .map(AssetResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> getAvailableAssets(Pageable pageable) {
        return assetRepository.findAvailableAssets(pageable)
            .map(AssetResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> getAssetsByUser(Long userId, Pageable pageable) {
        return assetRepository.findAssetsByUserId(userId, pageable)
            .map(AssetResponseDTO::fromEntity);
    }
    
    @Override
    public AssetResponseDTO updateAsset(Long id, AssetRequestDTO assetRequestDTO) {
        Asset existingAsset = assetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", id));
        
        if (!existingAsset.getAssetTag().equals(assetRequestDTO.getAssetTag()) && 
            assetRepository.findByAssetTag(assetRequestDTO.getAssetTag()).isPresent()) {
            throw new DuplicateResourceException("Asset", "assetTag", assetRequestDTO.getAssetTag());
        }
        
        existingAsset.setAssetTag(assetRequestDTO.getAssetTag());
        existingAsset.setName(assetRequestDTO.getName());
        existingAsset.setCategory(assetRequestDTO.getCategory());
        existingAsset.setType(assetRequestDTO.getType());
        existingAsset.setModel(assetRequestDTO.getModel());
        existingAsset.setSerialNumber(assetRequestDTO.getSerialNumber());
        existingAsset.setPurchaseDate(assetRequestDTO.getPurchaseDate());
        var oldWarranty = existingAsset.getWarrantyExpiryDate();
        existingAsset.setWarrantyExpiryDate(assetRequestDTO.getWarrantyExpiryDate());
        existingAsset.setCost(assetRequestDTO.getCost());
        existingAsset.setUsefulLifeYears(assetRequestDTO.getUsefulLifeYears());
        existingAsset.setStatus(assetRequestDTO.getStatus());
        existingAsset.setImageUrl(assetRequestDTO.getImageUrl());
        existingAsset.setIsShareable(assetRequestDTO.getIsShareable());
        existingAsset.setTotalLicenses(assetRequestDTO.getTotalLicenses());
        existingAsset.setUsedLicenses(assetRequestDTO.getUsedLicenses());
        existingAsset.setLicenseExpiryDate(assetRequestDTO.getLicenseExpiryDate());
        existingAsset.setLicenseKey(assetRequestDTO.getLicenseKey());
        existingAsset.setVersion(assetRequestDTO.getVersion());
        
        // Automatically set isShareable to true for software assets
        if (existingAsset.getCategory() == Asset.Category.SOFTWARE) {
            existingAsset.setIsShareable(true);
            // Set default values for license fields if not provided
            if (existingAsset.getTotalLicenses() == null) {
                existingAsset.setTotalLicenses(1);
            }
            if (existingAsset.getUsedLicenses() == null) {
                existingAsset.setUsedLicenses(0);
            }
        }
        
        if (assetRequestDTO.getVendorId() != null) {
            existingAsset.setVendor(vendorRepository.findById(assetRequestDTO.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", assetRequestDTO.getVendorId())));
        }
        
        Asset updatedAsset = assetRepository.save(existingAsset);
        if (oldWarranty == null || (assetRequestDTO.getWarrantyExpiryDate() != null && !assetRequestDTO.getWarrantyExpiryDate().equals(oldWarranty))) {
            warrantyHistoryService.record(updatedAsset, oldWarranty, assetRequestDTO.getWarrantyExpiryDate(), "Manual update");
        }
        
        // Notify about status changes
        if (existingAsset.getStatus() != assetRequestDTO.getStatus()) {
            try {
                if (assetRequestDTO.getStatus() == Asset.Status.MAINTENANCE) {
                    // Find current allocation and notify user
                    AssetAllocation currentAllocation = allocationRepository.findCurrentAllocationByAssetId(id).orElse(null);
                    if (currentAllocation != null) {
                        notificationService.createNotification(
                            currentAllocation.getUser().getId(),
                            "Asset Under Maintenance",
                            "Your asset '" + updatedAsset.getName() + "' is now under maintenance",
                            com.assetdesk.domain.Notification.Type.MAINTENANCE_DUE,
                            null,
                            updatedAsset.getId()
                        );
                    }
                } else if (assetRequestDTO.getStatus() == Asset.Status.AVAILABLE && existingAsset.getStatus() == Asset.Status.MAINTENANCE) {
                    // Notify IT support that asset is back from maintenance
                    List<com.assetdesk.domain.User> itUsers = userRepository.findByRole(com.assetdesk.domain.User.Role.IT_SUPPORT);
                    for (com.assetdesk.domain.User itUser : itUsers) {
                        notificationService.createNotification(
                            itUser.getId(),
                            "Asset Available",
                            "Asset '" + updatedAsset.getName() + "' is now available after maintenance",
                            com.assetdesk.domain.Notification.Type.SUCCESS,
                            null,
                            updatedAsset.getId()
                        );
                    }
                }
            } catch (Exception e) {
                System.out.println("Failed to create status change notification: " + e.getMessage());
            }
        }
        
        return AssetResponseDTO.fromEntity(updatedAsset);
    }
    
    @Override
    public void deleteAsset(Long id) {
        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", id));
        
        if (asset.getStatus() == Asset.Status.ALLOCATED) {
            throw new InvalidOperationException("Cannot delete allocated asset. Please return the asset first.");
        }
        
        AssetAllocation currentAllocation = assetAllocationService.getCurrentAllocation(id);
        if (currentAllocation != null) {
            throw new InvalidOperationException("Cannot delete asset with active allocation history.");
        }
        
        assetRepository.deleteById(id);
    }
    
    @Override
    public AssetResponseDTO allocateAssetByEmployeeId(Long assetId, String employeeId, String remarks) {
        User user = userRepository.findByEmployeeId(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "employeeId", employeeId));
        return allocateAsset(assetId, user.getId(), remarks);
    }
    
    @Override
    public AssetResponseDTO allocateAsset(Long assetId, Long userId, String remarks) {
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", assetId));
        
        // Validate user exists and is active
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        if (user.getStatus() != User.Status.ACTIVE) {
            throw new InvalidOperationException("Cannot allocate asset to inactive user");
        }
        
        // Handle shareable assets (software licenses)
        if (Boolean.TRUE.equals(asset.getIsShareable()) || asset.getCategory() == Asset.Category.SOFTWARE) {
            // Check if licenses are available
            int totalLicenses = asset.getTotalLicenses() != null ? asset.getTotalLicenses() : 1;
            int usedLicenses = asset.getUsedLicenses() != null ? asset.getUsedLicenses() : 0;
            
            if (usedLicenses >= totalLicenses) {
                throw new AssetNotAvailableException("No available licenses for " + asset.getAssetTag() + ". All " + totalLicenses + " licenses are in use.");
            }
            
            // For software assets, we only check license availability, not asset status
            // Asset can be ALLOCATED and still have available licenses
        } else {
            // Handle unique assets (hardware) - must be AVAILABLE status
            if (asset.getStatus() != Asset.Status.AVAILABLE) {
                throw new AssetNotAvailableException(asset.getAssetTag());
            }
        }
        
        AssetAllocation allocation = assetAllocationService.allocateAsset(assetId, userId, LocalDate.now(), remarks);
        // Reload asset to get updated license counts
        Asset updatedAsset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", assetId));
        return AssetResponseDTO.fromEntity(updatedAsset);
    }
    
    @Override
    public AssetResponseDTO returnAsset(Long assetId, String remarks) {
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", assetId));
        
        // Handle shareable assets (software licenses)
        if (Boolean.TRUE.equals(asset.getIsShareable())) {
            if (asset.getUsedLicenses() != null && asset.getUsedLicenses() > 0) {
                // Decrement used licenses
                asset.setUsedLicenses(asset.getUsedLicenses() - 1);
                // Update status to AVAILABLE if licenses become available
                if (asset.getUsedLicenses() < asset.getTotalLicenses()) {
                    asset.setStatus(Asset.Status.AVAILABLE);
                }
                assetRepository.save(asset);
            }
        } else {
            // Handle unique assets (hardware)
            if (asset.getStatus() != Asset.Status.ALLOCATED) {
                throw new InvalidOperationException("Asset is not currently allocated");
            }
        }
        
        AssetAllocation allocation = assetAllocationService.returnAsset(assetId, LocalDate.now(), remarks);
        // Reload asset to get updated license counts
        Asset updatedAsset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", assetId));
        return AssetResponseDTO.fromEntity(updatedAsset);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssetGroupResponseDTO> getAssetGroups() {
        List<Object[]> results = assetRepository.findAssetGroupsWithDetails();
        List<AssetGroupResponseDTO> groups = new ArrayList<>();
        
        for (Object[] result : results) {
            AssetGroupResponseDTO group = new AssetGroupResponseDTO(
                (String) result[0],  // name
                "",                  // model
                "",                  // category
                "",                  // type
                (Long) result[1],    // total
                (Long) result[2],    // available
                (Long) result[3],    // allocated
                (Long) result[4],    // maintenance
                (Long) result[5],    // retired
                java.math.BigDecimal.ZERO, // averageCost
                ""                   // vendor
            );
            groups.add(group);
        }
        
        return groups;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> getAssetsByName(String name, Pageable pageable) {
        return assetRepository.findByName(name, pageable)
            .map(asset -> {
                AssetAllocation currentAllocation = allocationRepository.findCurrentAllocationByAssetId(asset.getId()).orElse(null);
                return AssetResponseDTO.fromEntityWithAllocation(asset, currentAllocation);
            });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> getWarrantyExpiring(int days, Pageable pageable) {
        java.time.LocalDate start = java.time.LocalDate.now();
        java.time.LocalDate end = start.plusDays(days);
        return assetRepository.findByWarrantyExpiryDateBetween(start, end, pageable)
            .map(AssetResponseDTO::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> search(String name, String category, String type, String status, Pageable pageable) {
        Specification<Asset> spec = Specification.where(null);
        
        if (name != null && !name.trim().isEmpty()) {
            spec = spec.and(hasGlobalSearch(name));
        }
        
        spec = spec.and(hasCategory(category))
            .and(hasType(type))
            .and(hasStatus(status));
            
        return assetRepository.findAll(spec, pageable)
            .map(asset -> {
                AssetAllocation currentAllocation = allocationRepository.findCurrentAllocationByAssetId(asset.getId()).orElse(null);
                return AssetResponseDTO.fromEntityWithAllocation(asset, currentAllocation);
            });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> searchAdvanced(String name, String category, String type, String status, 
            String assetTag, String model, String serialNumber, String vendor, Pageable pageable) {
        Specification<Asset> spec = Specification.where(null);
        
        // Check if this is a global search (same term in multiple fields)
        boolean isGlobalSearch = name != null && name.equals(assetTag) && name.equals(model) && name.equals(serialNumber);
        
        if (isGlobalSearch) {
            spec = spec.and(hasGlobalSearch(name));
        } else {
            // Individual field searches
            spec = spec.and(hasNameLike(name))
                .and(hasAssetTagLike(assetTag))
                .and(hasModelLike(model))
                .and(hasSerialNumberLike(serialNumber));
        }
        
        // Add other filters
        spec = spec.and(hasCategory(category))
            .and(hasType(type))
            .and(hasStatus(status))
            .and(hasVendorNameLike(vendor));
            
        return assetRepository.findAll(spec, pageable)
            .map(asset -> {
                AssetAllocation currentAllocation = allocationRepository.findCurrentAllocationByAssetId(asset.getId()).orElse(null);
                return AssetResponseDTO.fromEntityWithAllocation(asset, currentAllocation);
            });
    }

    @Override
    @Transactional(readOnly = true)
    public AssetGroupSummaryDTO getGroupSummary(String name) {
        Specification<Asset> spec = Specification.where(hasNameLike(name));
        var all = assetRepository.findAll(spec);
        AssetGroupSummaryDTO dto = new AssetGroupSummaryDTO();
        dto.setName(name);
        dto.setTotal(all.size());
        dto.setAvailable(all.stream().filter(a -> a.getStatus() == Asset.Status.AVAILABLE).count());
        dto.setAllocated(all.stream().filter(a -> a.getStatus() == Asset.Status.ALLOCATED).count());
        dto.setMaintenance(all.stream().filter(a -> a.getStatus() == Asset.Status.MAINTENANCE).count());
        dto.setRetired(all.stream().filter(a -> a.getStatus() == Asset.Status.RETIRED).count());
        dto.setLost(all.stream().filter(a -> a.getStatus() == Asset.Status.LOST).count());

        java.util.List<AssetGroupSummaryDTO.UserBrief> users = new java.util.ArrayList<>();
        for (Asset a : all) {
            if (a.getStatus() == Asset.Status.ALLOCATED) {
                AssetAllocation current = assetAllocationService.getCurrentAllocation(a.getId());
                if (current != null && current.getUser() != null) {
                    AssetGroupSummaryDTO.UserBrief ub = new AssetGroupSummaryDTO.UserBrief();
                    ub.setId(current.getUser().getId());
                    ub.setName(current.getUser().getName());
                    ub.setDepartment(current.getUser().getDepartment());
                    ub.setEmail(current.getUser().getEmail());
                    users.add(ub);
                }
            }
        }
        dto.setAllocatedUsers(users);
        return dto;
    }

    @Override
    public AssetResponseDTO allocateFromGroup(String name, Long userId, String remarks) {
        Specification<Asset> spec = Specification.where(hasNameLike(name)).and(hasStatus("AVAILABLE"));
        var first = assetRepository.findAll(spec).stream().findFirst()
            .orElseThrow(() -> new InvalidOperationException("No available assets in the group"));
        return allocateAsset(first.getId(), userId, remarks);
    }
    
    @Override
    public AssetResponseDTO allocateFromGroupByEmployeeId(String name, String employeeId, String remarks) {
        User user = userRepository.findByEmployeeId(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "employeeId", employeeId));
        return allocateFromGroup(name, user.getId(), remarks);
    }
    
    @Override
    @Transactional(readOnly = true)
    public WarrantyStatsDTO getWarrantyStats() {
        long totalAssets = assetRepository.countAssetsWithWarranty();
        long expiredWarranties = assetRepository.countExpiredWarranties();
        long expiringIn30Days = assetRepository.countWarrantiesExpiringBefore(LocalDate.now().plusDays(30));
        long expiringIn90Days = assetRepository.countWarrantiesExpiringBefore(LocalDate.now().plusDays(90));
        long validWarranties = totalAssets - expiredWarranties;
        
        return new WarrantyStatsDTO(totalAssets, expiredWarranties, expiringIn30Days, expiringIn90Days, validWarranties);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> getExpiredWarranties(Pageable pageable) {
        return assetRepository.findExpiredWarranties(pageable)
            .map(AssetResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> getValidWarranties(Pageable pageable) {
        return assetRepository.findValidWarranties(pageable)
            .map(AssetResponseDTO::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public long getFilteredCount(String category, String type, String status, String dateFrom, String dateTo, String costMin, String costMax) {
        Specification<Asset> spec = Specification.where(null);
        
        if (category != null && !category.trim().isEmpty()) {
            spec = spec.and(hasCategory(category));
        }
        
        if (type != null && !type.trim().isEmpty()) {
            spec = spec.and(hasType(type));
        }
        
        if (status != null && !status.trim().isEmpty()) {
            spec = spec.and(hasStatus(status));
        }
        
        if (dateFrom != null && !dateFrom.trim().isEmpty()) {
            try {
                LocalDate fromDate = LocalDate.parse(dateFrom);
                spec = spec.and(hasPurchaseDateAfter(fromDate));
            } catch (Exception e) {
                // Ignore invalid date format
            }
        }
        
        if (dateTo != null && !dateTo.trim().isEmpty()) {
            try {
                LocalDate toDate = LocalDate.parse(dateTo);
                spec = spec.and(hasPurchaseDateBefore(toDate));
            } catch (Exception e) {
                // Ignore invalid date format
            }
        }
        
        if (costMin != null && !costMin.trim().isEmpty()) {
            try {
                java.math.BigDecimal minCost = new java.math.BigDecimal(costMin);
                spec = spec.and(hasCostGreaterThanOrEqual(minCost));
            } catch (Exception e) {
                // Ignore invalid number format
            }
        }
        
        if (costMax != null && !costMax.trim().isEmpty()) {
            try {
                java.math.BigDecimal maxCost = new java.math.BigDecimal(costMax);
                spec = spec.and(hasCostLessThanOrEqual(maxCost));
            } catch (Exception e) {
                // Ignore invalid number format
            }
        }
        
        return assetRepository.count(spec);
    }
    
    @Override
    public AssetResponseDTO retireAsset(Long id, String remarks) {
        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", id));
        
        // Check if asset is currently allocated
        if (asset.getStatus() == Asset.Status.ALLOCATED) {
            // Return the asset first
            AssetAllocation currentAllocation = allocationRepository.findCurrentAllocationByAssetId(id).orElse(null);
            if (currentAllocation != null) {
                assetAllocationService.returnAsset(id, LocalDate.now(), "Asset retired - automatic return");
            }
        }
        
        // Set asset status to RETIRED
        asset.setStatus(Asset.Status.RETIRED);
        Asset retiredAsset = assetRepository.save(asset);
        
        // Create service record for retirement
        try {
            com.assetdesk.domain.ServiceRecord serviceRecord = new com.assetdesk.domain.ServiceRecord();
            serviceRecord.setAsset(retiredAsset);
            serviceRecord.setServiceDate(LocalDate.now());
            serviceRecord.setServiceDescription("Asset retired from service" + (remarks != null ? ". Remarks: " + remarks : ""));
            serviceRecord.setServiceType("RETIREMENT");
            serviceRecord.setPerformedBy("System");
            serviceRecord.setStatus("COMPLETED");
            serviceRecord.setNotes("Asset permanently retired from active use");
            // Note: ServiceRecordRepository would need to be injected if we want to save this
        } catch (Exception e) {
            System.out.println("Failed to create retirement service record: " + e.getMessage());
        }
        
        // Notify IT support about asset retirement
        try {
            List<com.assetdesk.domain.User> itUsers = userRepository.findByRole(com.assetdesk.domain.User.Role.IT_SUPPORT);
            for (com.assetdesk.domain.User itUser : itUsers) {
                notificationService.createNotification(
                    itUser.getId(),
                    "Asset Retired",
                    "Asset '" + retiredAsset.getName() + "' has been retired from service",
                    com.assetdesk.domain.Notification.Type.INFO,
                    null,
                    retiredAsset.getId()
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to create retirement notification: " + e.getMessage());
        }
        
        return AssetResponseDTO.fromEntity(retiredAsset);
    }
}