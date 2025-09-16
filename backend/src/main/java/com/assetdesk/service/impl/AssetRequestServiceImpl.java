package com.assetdesk.service.impl;

import com.assetdesk.domain.Asset;
import com.assetdesk.domain.AssetRequest;
import com.assetdesk.domain.User;
import com.assetdesk.dto.request.AssetRequestCreateDTO;
import com.assetdesk.dto.request.AssetRequestResponseDTO;
import com.assetdesk.exception.ResourceNotFoundException;
import com.assetdesk.repository.AssetRepository;
import com.assetdesk.repository.AssetRequestRepository;
import com.assetdesk.repository.UserRepository;
import com.assetdesk.service.AssetRequestService;
import com.assetdesk.service.AssetAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetRequestServiceImpl implements AssetRequestService {

    private final AssetRequestRepository assetRequestRepository;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final AssetAllocationService assetAllocationService;
    private final com.assetdesk.service.NotificationService notificationService;

    @Override
    public AssetRequestResponseDTO createRequest(Long requesterId, AssetRequestCreateDTO dto) {
        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", requesterId));

        AssetRequest ar = new AssetRequest();
        ar.setRequestedBy(requester);
        ar.setRequestType(dto.getRequestType());
        ar.setCategory(dto.getCategory());
        ar.setAssetType(dto.getAssetType());
        ar.setAssetName(dto.getAssetName());
        ar.setPreferredModel(dto.getPreferredModel());
        ar.setEstimatedCost(dto.getEstimatedCost());
        ar.setBusinessJustification(dto.getBusinessJustification());
        ar.setPriority(dto.getPriority());
        ar.setRequiredDate(dto.getRequiredDate());
        ar.setSpecifications(dto.getSpecifications());
        ar.setAdditionalNotes(dto.getAdditionalNotes());
        ar.setStatus(AssetRequest.Status.PENDING);
        ar.setRequestedDate(LocalDateTime.now());

        AssetRequest savedRequest = assetRequestRepository.save(ar);
        
        // Create notification for new request to admins
        try {
            List<com.assetdesk.domain.User> admins = userRepository.findByRole(com.assetdesk.domain.User.Role.ADMIN);
            for (com.assetdesk.domain.User admin : admins) {
                notificationService.createNotification(
                    admin.getId(),
                    "New Asset Request",
                    "New asset request for '" + ar.getAssetName() + "' submitted by " + requester.getName(),
                    com.assetdesk.domain.Notification.Type.INFO
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to create request notification: " + e.getMessage());
        }
        
        return AssetRequestResponseDTO.fromEntity(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetRequestResponseDTO> listRequests(Pageable pageable) {
        return assetRequestRepository.findAll(pageable).map(AssetRequestResponseDTO::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetRequestResponseDTO> listMyRequests(Long requesterId, Pageable pageable) {
        return assetRequestRepository.findByRequestedById(requesterId, pageable).map(AssetRequestResponseDTO::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetRequestResponseDTO getById(Long id) {
        AssetRequest ar = assetRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("AssetRequest", "id", id));
        return AssetRequestResponseDTO.fromEntity(ar);
    }

    @Override
    public AssetRequestResponseDTO updateRequest(Long id, AssetRequestCreateDTO dto) {
        AssetRequest ar = assetRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("AssetRequest", "id", id));
        
        if (ar.getStatus() != AssetRequest.Status.PENDING) {
            throw new IllegalStateException("Cannot update non-pending request");
        }
        
        ar.setRequestType(dto.getRequestType());
        ar.setCategory(dto.getCategory());
        ar.setAssetType(dto.getAssetType());
        ar.setAssetName(dto.getAssetName());
        ar.setPreferredModel(dto.getPreferredModel());
        ar.setEstimatedCost(dto.getEstimatedCost());
        ar.setBusinessJustification(dto.getBusinessJustification());
        ar.setPriority(dto.getPriority());
        ar.setRequiredDate(dto.getRequiredDate());
        ar.setSpecifications(dto.getSpecifications());
        ar.setAdditionalNotes(dto.getAdditionalNotes());
        
        return AssetRequestResponseDTO.fromEntity(assetRequestRepository.save(ar));
    }

    @Override
    public AssetRequestResponseDTO approve(Long requestId, Long approverId, String remarks) {
        AssetRequest ar = assetRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("AssetRequest", "id", requestId));
        User approver = userRepository.findById(approverId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", approverId));
        ar.setStatus(AssetRequest.Status.APPROVED);
        ar.setApprovedBy(approver);
        ar.setApprovedDate(LocalDateTime.now());
        ar.setRemarks(remarks);
        AssetRequest savedRequest = assetRequestRepository.save(ar);
        
        // Create notification for approval
        try {
            notificationService.createNotification(
                ar.getRequestedBy().getId(),
                "Request Approved",
                "Your asset request for '" + ar.getAssetName() + "' has been approved",
                com.assetdesk.domain.Notification.Type.SUCCESS
            );
        } catch (Exception e) {
            System.out.println("Failed to create approval notification: " + e.getMessage());
        }
        
        return AssetRequestResponseDTO.fromEntity(savedRequest);
    }

    @Override
    public AssetRequestResponseDTO reject(Long requestId, Long approverId, String remarks) {
        AssetRequest ar = assetRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("AssetRequest", "id", requestId));
        User approver = userRepository.findById(approverId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", approverId));
        ar.setStatus(AssetRequest.Status.REJECTED);
        ar.setRejectedBy(approver);
        ar.setRejectedDate(LocalDateTime.now());
        ar.setRejectionReason(remarks);
        AssetRequest savedRequest = assetRequestRepository.save(ar);
        
        // Create notification for rejection
        try {
            notificationService.createNotification(
                ar.getRequestedBy().getId(),
                "Request Rejected",
                "Your asset request for '" + ar.getAssetName() + "' has been rejected. Reason: " + remarks,
                com.assetdesk.domain.Notification.Type.WARNING
            );
        } catch (Exception e) {
            System.out.println("Failed to create rejection notification: " + e.getMessage());
        }
        
        return AssetRequestResponseDTO.fromEntity(savedRequest);
    }

    @Override
    public AssetRequestResponseDTO fulfill(Long requestId, Long assetId, Long approverId, String remarks) {
        AssetRequest ar = assetRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("AssetRequest", "id", requestId));
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", assetId));
        User approver = userRepository.findById(approverId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", approverId));
        
        if (ar.getStatus() != AssetRequest.Status.APPROVED) {
            throw new IllegalStateException("Can only fulfill approved requests");
        }
        
        if (asset.getStatus() != Asset.Status.AVAILABLE) {
            throw new IllegalStateException("Asset is not available for allocation");
        }
        
        // Allocate asset to requester
        assetAllocationService.allocateAsset(assetId, ar.getRequestedBy().getId(), 
            LocalDateTime.now().toLocalDate(), "Fulfilled from request #" + requestId);
        
        // Update request
        ar.setStatus(AssetRequest.Status.FULFILLED);
        ar.setFulfilledBy(approver);
        ar.setFulfilledDate(LocalDateTime.now());
        ar.setAllocatedAsset(asset);
        ar.setRemarks(remarks);
        
        AssetRequest savedRequest = assetRequestRepository.save(ar);
        
        // Create notification for fulfillment
        try {
            notificationService.createNotification(
                ar.getRequestedBy().getId(),
                "Request Fulfilled",
                "Your asset request for '" + ar.getAssetName() + "' has been fulfilled with asset: " + asset.getName(),
                com.assetdesk.domain.Notification.Type.SUCCESS,
                null,
                asset.getId()
            );
        } catch (Exception e) {
            System.out.println("Failed to create fulfillment notification: " + e.getMessage());
        }
        
        return AssetRequestResponseDTO.fromEntity(savedRequest);
    }
}