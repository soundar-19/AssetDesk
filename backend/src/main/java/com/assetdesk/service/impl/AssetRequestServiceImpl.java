package com.assetdesk.service.impl;

import com.assetdesk.domain.AssetRequest;
import com.assetdesk.domain.User;
import com.assetdesk.dto.request.AssetRequestCreateDTO;
import com.assetdesk.dto.request.AssetRequestResponseDTO;
import com.assetdesk.exception.ResourceNotFoundException;
import com.assetdesk.repository.AssetRequestRepository;
import com.assetdesk.repository.UserRepository;
import com.assetdesk.service.AssetRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetRequestServiceImpl implements AssetRequestService {

    private final AssetRequestRepository assetRequestRepository;
    private final UserRepository userRepository;

    @Override
    public AssetRequestResponseDTO createRequest(Long requesterId, AssetRequestCreateDTO dto) {
        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", requesterId));

        AssetRequest ar = new AssetRequest();
        ar.setRequester(requester);
        ar.setRequestType(dto.getRequestType());
        ar.setRequestedCategory(dto.getRequestedCategory());
        ar.setRequestedType(dto.getRequestedType());
        ar.setRequestedModel(dto.getRequestedModel());
        ar.setJustification(dto.getJustification());
        ar.setStatus(AssetRequest.Status.PENDING);
        ar.setCreatedAt(LocalDateTime.now());

        return AssetRequestResponseDTO.fromEntity(assetRequestRepository.save(ar));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetRequestResponseDTO> listRequests(Pageable pageable) {
        return assetRequestRepository.findAll(pageable).map(AssetRequestResponseDTO::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetRequestResponseDTO> listMyRequests(Long requesterId, Pageable pageable) {
        return assetRequestRepository.findByRequesterId(requesterId, pageable).map(AssetRequestResponseDTO::fromEntity);
    }

    @Override
    public AssetRequestResponseDTO approve(Long requestId, Long approverId, String remarks) {
        AssetRequest ar = assetRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("AssetRequest", "id", requestId));
        User approver = userRepository.findById(approverId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", approverId));
        ar.setStatus(AssetRequest.Status.APPROVED);
        ar.setDecisionBy(approver);
        ar.setDecisionAt(LocalDateTime.now());
        ar.setDecisionRemarks(remarks);
        return AssetRequestResponseDTO.fromEntity(assetRequestRepository.save(ar));
    }

    @Override
    public AssetRequestResponseDTO reject(Long requestId, Long approverId, String remarks) {
        AssetRequest ar = assetRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("AssetRequest", "id", requestId));
        User approver = userRepository.findById(approverId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", approverId));
        ar.setStatus(AssetRequest.Status.REJECTED);
        ar.setDecisionBy(approver);
        ar.setDecisionAt(LocalDateTime.now());
        ar.setDecisionRemarks(remarks);
        return AssetRequestResponseDTO.fromEntity(assetRequestRepository.save(ar));
    }
}


