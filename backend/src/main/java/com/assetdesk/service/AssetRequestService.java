package com.assetdesk.service;

import com.assetdesk.dto.request.AssetRequestCreateDTO;
import com.assetdesk.dto.request.AssetRequestResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssetRequestService {
    AssetRequestResponseDTO createRequest(Long requesterId, AssetRequestCreateDTO dto);
    Page<AssetRequestResponseDTO> listRequests(Pageable pageable);
    Page<AssetRequestResponseDTO> listMyRequests(Long requesterId, Pageable pageable);
    AssetRequestResponseDTO getById(Long id);
    AssetRequestResponseDTO updateRequest(Long id, AssetRequestCreateDTO dto);
    AssetRequestResponseDTO approve(Long requestId, Long approverId, String remarks);
    AssetRequestResponseDTO reject(Long requestId, Long approverId, String remarks);
    AssetRequestResponseDTO fulfill(Long requestId, Long assetId, Long approverId, String remarks);
}


