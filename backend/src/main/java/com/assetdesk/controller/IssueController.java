package com.assetdesk.controller;

import com.assetdesk.dto.issue.IssueRequestDTO;
import com.assetdesk.dto.issue.IssueResponseDTO;
import com.assetdesk.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.util.HtmlUtils;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class IssueController {
    
    private final IssueService issueService;
    
    @PostMapping
    public ResponseEntity<IssueResponseDTO> createIssue(@Valid @RequestBody IssueRequestDTO issueRequestDTO, @RequestParam @Min(1) Long reportedById) {
        System.out.println("Creating issue - ReportedById: " + reportedById + ", AssetId: " + issueRequestDTO.getAssetId());
        IssueResponseDTO createdIssue = issueService.createIssue(issueRequestDTO, reportedById);
        return new ResponseEntity<>(createdIssue, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<IssueResponseDTO> getIssueById(@PathVariable @Min(1) Long id) {
        IssueResponseDTO issue = issueService.getIssueById(id);
        return ResponseEntity.ok(issue);
    }
    
    @GetMapping
    public ResponseEntity<Page<IssueResponseDTO>> getAllIssues(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
            sortBy != null ? org.springframework.data.domain.Sort.by(
                "desc".equalsIgnoreCase(sortDir) ? 
                org.springframework.data.domain.Sort.Direction.DESC : 
                org.springframework.data.domain.Sort.Direction.ASC, sortBy) : 
            org.springframework.data.domain.Sort.unsorted());
        Page<IssueResponseDTO> issues = issueService.getAllIssues(pageable);
        return ResponseEntity.ok(issues);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<IssueResponseDTO>> searchIssues(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long reportedById,
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
            sortBy != null ? org.springframework.data.domain.Sort.by(
                "desc".equalsIgnoreCase(sortDir) ? 
                org.springframework.data.domain.Sort.Direction.DESC : 
                org.springframework.data.domain.Sort.Direction.ASC, sortBy) : 
            org.springframework.data.domain.Sort.unsorted());
        Page<IssueResponseDTO> issues = issueService.searchIssues(title, description, status, 
            priority, type, reportedById, assignedToId, assetId, pageable);
        return ResponseEntity.ok(issues);
    }



    @PostMapping("/{id}/unassign")
    public ResponseEntity<IssueResponseDTO> unassignIssue(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.unassignIssue(id));
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<IssueResponseDTO> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(issueService.updateStatus(id, status));
    }

    @PostMapping("/{id}/priority")
    public ResponseEntity<IssueResponseDTO> updatePriority(@PathVariable Long id, @RequestParam String priority) {
        return ResponseEntity.ok(issueService.updatePriority(id, priority));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<IssueResponseDTO> resolve(@PathVariable Long id, @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(issueService.resolveIssue(id, notes));
    }
    
    @GetMapping("/all")
    public ResponseEntity<Page<IssueResponseDTO>> getAllIssuesIncludingClosed(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<IssueResponseDTO> issues = issueService.getAllIssuesIncludingClosed(pageable);
        return ResponseEntity.ok(issues);
    }
    
    @GetMapping("/reported-by/{userId}")
    public ResponseEntity<Page<IssueResponseDTO>> getIssuesByReportedBy(
            @PathVariable @Min(1) Long userId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<IssueResponseDTO> issues = issueService.getIssuesByReportedBy(userId, pageable);
        return ResponseEntity.ok(issues);
    }
    
    @GetMapping("/assigned-to/{userId}")
    public ResponseEntity<Page<IssueResponseDTO>> getIssuesByAssignedTo(
            @PathVariable @Min(1) Long userId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<IssueResponseDTO> issues = issueService.getIssuesByAssignedTo(userId, pageable);
        return ResponseEntity.ok(issues);
    }
    
    @GetMapping("/asset/{assetId}")
    public ResponseEntity<Page<IssueResponseDTO>> getIssuesByAsset(
            @PathVariable @Min(1) Long assetId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<IssueResponseDTO> issues = issueService.getIssuesByAsset(assetId, pageable);
        return ResponseEntity.ok(issues);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<IssueResponseDTO>> getIssuesByStatus(
            @PathVariable @Pattern(regexp = "^[A-Z_]+$") String status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        String sanitizedStatus = HtmlUtils.htmlEscape(status);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<IssueResponseDTO> issues = issueService.getIssuesByStatus(sanitizedStatus, pageable);
        return ResponseEntity.ok(issues);
    }
    
    @GetMapping("/active")
    public ResponseEntity<Page<IssueResponseDTO>> getActiveIssues(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<IssueResponseDTO> issues = issueService.getActiveIssues(pageable);
        return ResponseEntity.ok(issues);
    }
    
    @GetMapping("/unassigned")
    public ResponseEntity<Page<IssueResponseDTO>> getUnassignedIssues(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<IssueResponseDTO> issues = issueService.getUnassignedIssues(pageable);
        return ResponseEntity.ok(issues);
    }
    
    @PutMapping("/{issueId}/assign/{assignedToId}")
    public ResponseEntity<IssueResponseDTO> assignIssue(@PathVariable @Min(1) Long issueId, @PathVariable @Min(1) Long assignedToId) {
        IssueResponseDTO assignedIssue = issueService.assignIssue(issueId, assignedToId);
        return ResponseEntity.ok(assignedIssue);
    }
    
    @PutMapping("/{issueId}/status")
    public ResponseEntity<IssueResponseDTO> updateIssueStatus(@PathVariable @Min(1) Long issueId, @RequestParam @Pattern(regexp = "^[A-Z_]+$") String status, @RequestParam(required = false) Long userId) {
        String sanitizedStatus = HtmlUtils.htmlEscape(status);
        IssueResponseDTO updatedIssue = issueService.updateStatus(issueId, sanitizedStatus);
        return ResponseEntity.ok(updatedIssue);
    }
    
    @PutMapping("/{issueId}/resolve")
    @PreAuthorize("hasRole('IT_SUPPORT')")
    public ResponseEntity<IssueResponseDTO> resolveIssue(@PathVariable @Min(1) Long issueId, @RequestParam String resolutionNotes, @RequestParam(required = false) Double cost) {
        String sanitizedNotes = HtmlUtils.htmlEscape(resolutionNotes);
        IssueResponseDTO resolvedIssue = issueService.resolveIssue(issueId, sanitizedNotes, cost);
        return ResponseEntity.ok(resolvedIssue);
    }
    
    @PutMapping("/{issueId}/close")
    public ResponseEntity<IssueResponseDTO> closeIssue(@PathVariable @Min(1) Long issueId, @RequestParam @Min(1) Long userId) {
        IssueResponseDTO closedIssue = issueService.closeIssue(issueId, userId);
        return ResponseEntity.ok(closedIssue);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<IssueResponseDTO> updateIssue(@PathVariable @Min(1) Long id, @Valid @RequestBody IssueRequestDTO issueRequestDTO) {
        IssueResponseDTO updatedIssue = issueService.updateIssue(id, issueRequestDTO);
        return ResponseEntity.ok(updatedIssue);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable @Min(1) Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/notify")
    public ResponseEntity<Void> sendIssueNotification(@PathVariable @Min(1) Long id, @RequestBody java.util.Map<String, String> request) {
        issueService.sendIssueNotification(id, request.get("title"), request.get("message"), request.get("type"));
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/test-auth")
    public ResponseEntity<String> testAuth() {
        return ResponseEntity.ok("Authentication working!");
    }
}