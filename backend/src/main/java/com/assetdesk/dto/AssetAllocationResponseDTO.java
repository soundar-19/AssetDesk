package com.assetdesk.dto;

import com.assetdesk.domain.AssetAllocation;
import lombok.Data;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Data
public class AssetAllocationResponseDTO {
    
    private Long id;
    private Long assetId;
    private String assetTag;
    private String assetName;
    private String assetCategory;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDate allocatedDate;
    private LocalDate returnedDate;
    private String remarks;
    private String status;
    private Long daysAllocated;
    
    public static AssetAllocationResponseDTO fromEntity(AssetAllocation allocation) {
        AssetAllocationResponseDTO dto = new AssetAllocationResponseDTO();
        dto.setId(allocation.getId());
        
        if (allocation.getAsset() != null) {
            dto.setAssetId(allocation.getAsset().getId());
            dto.setAssetTag(allocation.getAsset().getAssetTag());
            dto.setAssetName(allocation.getAsset().getName());
            dto.setAssetCategory(allocation.getAsset().getCategory() != null ? 
                allocation.getAsset().getCategory().toString() : "N/A");
        }
        
        if (allocation.getUser() != null) {
            dto.setUserId(allocation.getUser().getId());
            dto.setUserName(allocation.getUser().getName());
            dto.setUserEmail(allocation.getUser().getEmail());
        }
        
        dto.setAllocatedDate(allocation.getAllocatedDate());
        dto.setReturnedDate(allocation.getReturnedDate());
        dto.setRemarks(allocation.getRemarks());
        
        // Calculate status and days allocated
        if (allocation.getReturnedDate() != null) {
            dto.setStatus("RETURNED");
            dto.setDaysAllocated(ChronoUnit.DAYS.between(
                allocation.getAllocatedDate(), allocation.getReturnedDate()));
        } else {
            dto.setStatus("ACTIVE");
            dto.setDaysAllocated(ChronoUnit.DAYS.between(
                allocation.getAllocatedDate(), LocalDate.now()));
        }
        
        return dto;
    }
}