package com.assetdesk.dto.request;

import com.assetdesk.domain.Asset;
import com.assetdesk.domain.AssetRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssetRequestCreateDTO {
    @NotNull
    private AssetRequest.RequestType requestType;
    private Asset.Category requestedCategory;
    private Asset.AssetType requestedType;
    private String requestedModel;
    private String justification;
}


