package com.assetdesk.dto.request;

import com.assetdesk.domain.AssetRequest;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AssetRequestResponseDTO {
    private Long id;
    private Long requesterId;
    private String requesterName;
    private AssetRequest.RequestType requestType;
    private String requestedCategory;
    private String requestedType;
    private String requestedModel;
    private String justification;
    private AssetRequest.Status status;
    private LocalDateTime createdAt;
    private Long decisionById;
    private String decisionByName;
    private LocalDateTime decisionAt;
    private String decisionRemarks;

    public static AssetRequestResponseDTO fromEntity(AssetRequest ar) {
        AssetRequestResponseDTO dto = new AssetRequestResponseDTO();
        dto.setId(ar.getId());
        dto.setRequesterId(ar.getRequester() != null ? ar.getRequester().getId() : null);
        dto.setRequesterName(ar.getRequester() != null ? ar.getRequester().getName() : null);
        dto.setRequestType(ar.getRequestType());
        dto.setRequestedCategory(ar.getRequestedCategory() != null ? ar.getRequestedCategory().name() : null);
        dto.setRequestedType(ar.getRequestedType() != null ? ar.getRequestedType().name() : null);
        dto.setRequestedModel(ar.getRequestedModel());
        dto.setJustification(ar.getJustification());
        dto.setStatus(ar.getStatus());
        dto.setCreatedAt(ar.getCreatedAt());
        dto.setDecisionById(ar.getDecisionBy() != null ? ar.getDecisionBy().getId() : null);
        dto.setDecisionByName(ar.getDecisionBy() != null ? ar.getDecisionBy().getName() : null);
        dto.setDecisionAt(ar.getDecisionAt());
        dto.setDecisionRemarks(ar.getDecisionRemarks());
        return dto;
    }
}


