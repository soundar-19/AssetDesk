package com.assetdesk.service.impl;

import com.assetdesk.dto.asset.AssetRequestDTO;
import com.assetdesk.dto.asset.AssetResponseDTO;
import com.assetdesk.dto.asset.AssetGroupResponseDTO;
import com.assetdesk.domain.Asset;
import com.assetdesk.domain.AssetAllocation;
import com.assetdesk.domain.User;
import com.assetdesk.repository.AssetRepository;
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
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final AssetAllocationService assetAllocationService;
    private final com.assetdesk.service.WarrantyHistoryService warrantyHistoryService;
    
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
        
        if (assetRequestDTO.getVendorId() != null) {
            asset.setVendor(vendorRepository.findById(assetRequestDTO.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", assetRequestDTO.getVendorId())));
        }
        
        Asset savedAsset = assetRepository.save(asset);
        if (savedAsset.getWarrantyExpiryDate() != null) {
            warrantyHistoryService.record(savedAsset, null, savedAsset.getWarrantyExpiryDate(), "Initial creation");
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
            .map(AssetResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> getAssetsByCategory(String category, Pageable pageable) {
        Asset.Category assetCategory = Asset.Category.valueOf(category.toUpperCase(Locale.ROOT));
        return assetRepository.findByCategory(assetCategory, pageable)
            .map(AssetResponseDTO::fromEntity);
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
        existingAsset.setTotalLicenses(assetRequestDTO.getTotalLicenses());
        existingAsset.setUsedLicenses(assetRequestDTO.getUsedLicenses());
        existingAsset.setLicenseExpiryDate(assetRequestDTO.getLicenseExpiryDate());
        existingAsset.setLicenseKey(assetRequestDTO.getLicenseKey());
        existingAsset.setVersion(assetRequestDTO.getVersion());
        
        if (assetRequestDTO.getVendorId() != null) {
            existingAsset.setVendor(vendorRepository.findById(assetRequestDTO.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", assetRequestDTO.getVendorId())));
        }
        
        Asset updatedAsset = assetRepository.save(existingAsset);
        if (oldWarranty == null || (assetRequestDTO.getWarrantyExpiryDate() != null && !assetRequestDTO.getWarrantyExpiryDate().equals(oldWarranty))) {
            warrantyHistoryService.record(updatedAsset, oldWarranty, assetRequestDTO.getWarrantyExpiryDate(), "Manual update");
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
    public AssetResponseDTO allocateAsset(Long assetId, Long userId, String remarks) {
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", assetId));
        
        if (asset.getStatus() != Asset.Status.AVAILABLE) {
            throw new AssetNotAvailableException(asset.getAssetTag());
        }
        
        // Validate user exists and is active
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        if (user.getStatus() != User.Status.ACTIVE) {
            throw new InvalidOperationException("Cannot allocate asset to inactive user");
        }
        
        AssetAllocation allocation = assetAllocationService.allocateAsset(assetId, userId, LocalDate.now(), remarks);
        return AssetResponseDTO.fromEntity(allocation.getAsset());
    }
    
    @Override
    public AssetResponseDTO returnAsset(Long assetId, String remarks) {
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", assetId));
        
        if (asset.getStatus() != Asset.Status.ALLOCATED) {
            throw new InvalidOperationException("Asset is not currently allocated");
        }
        
        AssetAllocation allocation = assetAllocationService.returnAsset(assetId, LocalDate.now(), remarks);
        return AssetResponseDTO.fromEntity(allocation.getAsset());
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
            .map(AssetResponseDTO::fromEntity);
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
        Specification<Asset> spec = Specification.where(hasNameLike(name))
            .and(hasCategory(category))
            .and(hasType(type))
            .and(hasStatus(status));
        return assetRepository.findAll(spec, pageable).map(AssetResponseDTO::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponseDTO> searchAdvanced(String name, String category, String type, String status, 
            String assetTag, String model, String serialNumber, String vendor, Pageable pageable) {
        Specification<Asset> spec = Specification.where(null);
        
        // Handle global search - if multiple text fields have the same value, treat as OR search
        if (name != null && name.equals(assetTag) && name.equals(model) && name.equals(serialNumber)) {
            spec = spec.and(Specification.where(hasNameLike(name))
                .or(hasAssetTagLike(name))
                .or(hasModelLike(name))
                .or(hasSerialNumberLike(name)));
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
            
        return assetRepository.findAll(spec, pageable).map(AssetResponseDTO::fromEntity);
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
}