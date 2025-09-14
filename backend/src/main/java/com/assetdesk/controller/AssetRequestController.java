package com.assetdesk.controller;
import org.springframework.security.access.prepost.PreAuthorize;

import com.assetdesk.dto.request.AssetRequestCreateDTO;
import com.assetdesk.dto.request.AssetRequestResponseDTO;
import com.assetdesk.service.AssetRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/asset-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssetRequestController {

    private final AssetRequestService assetRequestService;

    @PostMapping
    public ResponseEntity<AssetRequestResponseDTO> create(
            @Valid @RequestBody AssetRequestCreateDTO dto) {
        return new ResponseEntity<>(assetRequestService.createRequest(dto.getRequestedBy(), dto), HttpStatus.CREATED);
    }

    @PostMapping("/user/{requesterId}")
    public ResponseEntity<AssetRequestResponseDTO> createForUser(
            @PathVariable Long requesterId,
            @Valid @RequestBody AssetRequestCreateDTO dto) {
        return new ResponseEntity<>(assetRequestService.createRequest(requesterId, dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<AssetRequestResponseDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(assetRequestService.listRequests(pageable));
    }

    @GetMapping("/user/{requesterId}")
    public ResponseEntity<Page<AssetRequestResponseDTO>> myRequests(
            @PathVariable Long requesterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(assetRequestService.listMyRequests(requesterId, pageable));
    }

    @PreAuthorize("hasAnyRole('ADMIN','IT_SUPPORT')")
    @PostMapping("/{id}/approve/{approverId}")
    public ResponseEntity<AssetRequestResponseDTO> approve(
            @PathVariable Long id,
            @PathVariable Long approverId,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(assetRequestService.approve(id, approverId, remarks));
    }

    @PreAuthorize("hasAnyRole('ADMIN','IT_SUPPORT')")
    @PostMapping("/{id}/reject/{approverId}")
    public ResponseEntity<AssetRequestResponseDTO> reject(
            @PathVariable Long id,
            @PathVariable Long approverId,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(assetRequestService.reject(id, approverId, remarks));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetRequestResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(assetRequestService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetRequestResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody AssetRequestCreateDTO dto) {
        return ResponseEntity.ok(assetRequestService.updateRequest(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','IT_SUPPORT')")
    @PostMapping("/{requestId}/fulfill/{assetId}/{approverId}")
    public ResponseEntity<AssetRequestResponseDTO> fulfill(
            @PathVariable Long requestId,
            @PathVariable Long assetId,
            @PathVariable Long approverId,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(assetRequestService.fulfill(requestId, assetId, approverId, remarks));
    }
}


