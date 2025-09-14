package com.assetdesk.dto.request;

import com.assetdesk.domain.Asset;
import com.assetdesk.domain.AssetRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssetRequestCreateDTO {
    @NotNull
    private AssetRequest.RequestType requestType;
    @NotNull
    private String category;
    @NotNull
    private String assetType;
    @NotNull
    private String assetName;
    private String preferredModel;
    private Double estimatedCost;
    @NotNull
    private String businessJustification;
    @NotNull
    private AssetRequest.Priority priority;
    private String requiredDate;
    private String specifications;
    private String additionalNotes;
    @NotNull
    private Long requestedBy;
}


