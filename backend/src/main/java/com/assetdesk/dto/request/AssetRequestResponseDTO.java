package com.assetdesk.dto.request;

import com.assetdesk.domain.AssetRequest;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AssetRequestResponseDTO {
    private Long id;
    private AssetRequest.RequestType requestType;
    private String category;
    private String assetType;
    private String assetName;
    private String preferredModel;
    private Double estimatedCost;
    private String businessJustification;
    private AssetRequest.Priority priority;
    private String requiredDate;
    private String specifications;
    private String additionalNotes;
    private AssetRequest.Status status;
    private LocalDateTime requestedDate;
    
    // Requester info
    private RequestedByDTO requestedBy;
    
    // Approval info
    private ApprovedByDTO approvedBy;
    private LocalDateTime approvedDate;
    
    // Rejection info
    private RejectedByDTO rejectedBy;
    private LocalDateTime rejectedDate;
    private String rejectionReason;
    
    // Fulfillment info
    private FulfilledByDTO fulfilledBy;
    private LocalDateTime fulfilledDate;
    private AllocatedAssetDTO allocatedAsset;
    
    private String remarks;
    
    @Data
    public static class RequestedByDTO {
        private Long id;
        private String name;
        private String email;
        private String department;
    }
    
    @Data
    public static class ApprovedByDTO {
        private Long id;
        private String name;
    }
    
    @Data
    public static class RejectedByDTO {
        private Long id;
        private String name;
    }
    
    @Data
    public static class FulfilledByDTO {
        private Long id;
        private String name;
    }
    
    @Data
    public static class AllocatedAssetDTO {
        private Long id;
        private String assetTag;
        private String name;
    }

    public static AssetRequestResponseDTO fromEntity(AssetRequest ar) {
        AssetRequestResponseDTO dto = new AssetRequestResponseDTO();
        dto.setId(ar.getId());
        dto.setRequestType(ar.getRequestType());
        dto.setCategory(ar.getCategory());
        dto.setAssetType(ar.getAssetType());
        dto.setAssetName(ar.getAssetName());
        dto.setPreferredModel(ar.getPreferredModel());
        dto.setEstimatedCost(ar.getEstimatedCost());
        dto.setBusinessJustification(ar.getBusinessJustification());
        dto.setPriority(ar.getPriority());
        dto.setRequiredDate(ar.getRequiredDate());
        dto.setSpecifications(ar.getSpecifications());
        dto.setAdditionalNotes(ar.getAdditionalNotes());
        dto.setStatus(ar.getStatus());
        dto.setRequestedDate(ar.getRequestedDate());
        
        if (ar.getRequestedBy() != null) {
            RequestedByDTO requestedBy = new RequestedByDTO();
            requestedBy.setId(ar.getRequestedBy().getId());
            requestedBy.setName(ar.getRequestedBy().getName());
            requestedBy.setEmail(ar.getRequestedBy().getEmail());
            requestedBy.setDepartment(ar.getRequestedBy().getDepartment());
            dto.setRequestedBy(requestedBy);
        }
        
        if (ar.getApprovedBy() != null) {
            ApprovedByDTO approvedBy = new ApprovedByDTO();
            approvedBy.setId(ar.getApprovedBy().getId());
            approvedBy.setName(ar.getApprovedBy().getName());
            dto.setApprovedBy(approvedBy);
        }
        dto.setApprovedDate(ar.getApprovedDate());
        
        if (ar.getRejectedBy() != null) {
            RejectedByDTO rejectedBy = new RejectedByDTO();
            rejectedBy.setId(ar.getRejectedBy().getId());
            rejectedBy.setName(ar.getRejectedBy().getName());
            dto.setRejectedBy(rejectedBy);
        }
        dto.setRejectedDate(ar.getRejectedDate());
        dto.setRejectionReason(ar.getRejectionReason());
        
        if (ar.getFulfilledBy() != null) {
            FulfilledByDTO fulfilledBy = new FulfilledByDTO();
            fulfilledBy.setId(ar.getFulfilledBy().getId());
            fulfilledBy.setName(ar.getFulfilledBy().getName());
            dto.setFulfilledBy(fulfilledBy);
        }
        dto.setFulfilledDate(ar.getFulfilledDate());
        
        if (ar.getAllocatedAsset() != null) {
            AllocatedAssetDTO allocatedAsset = new AllocatedAssetDTO();
            allocatedAsset.setId(ar.getAllocatedAsset().getId());
            allocatedAsset.setAssetTag(ar.getAllocatedAsset().getAssetTag());
            allocatedAsset.setName(ar.getAllocatedAsset().getName());
            dto.setAllocatedAsset(allocatedAsset);
        }
        
        dto.setRemarks(ar.getRemarks());
        return dto;
    }
}


