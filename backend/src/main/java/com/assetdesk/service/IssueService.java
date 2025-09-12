package com.assetdesk.service;

import com.assetdesk.dto.issue.IssueRequestDTO;
import com.assetdesk.dto.issue.IssueResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IssueService {
    
    IssueResponseDTO createIssue(IssueRequestDTO issueRequestDTO, Long reportedById);
    IssueResponseDTO getIssueById(Long id);
    Page<IssueResponseDTO> getAllIssues(Pageable pageable);
    Page<IssueResponseDTO> getAllIssuesIncludingClosed(Pageable pageable);
    Page<IssueResponseDTO> getIssuesByReportedBy(Long userId, Pageable pageable);
    Page<IssueResponseDTO> getIssuesByAssignedTo(Long userId, Pageable pageable);
    Page<IssueResponseDTO> getIssuesByAsset(Long assetId, Pageable pageable);
    Page<IssueResponseDTO> getIssuesByStatus(String status, Pageable pageable);
    Page<IssueResponseDTO> getActiveIssues(Pageable pageable);
    Page<IssueResponseDTO> getUnassignedIssues(Pageable pageable);
    IssueResponseDTO assignIssue(Long issueId, Long assignedToId);
    IssueResponseDTO unassignIssue(Long issueId);
    IssueResponseDTO updateStatus(Long issueId, String status);
    IssueResponseDTO updatePriority(Long issueId, String priority);
    IssueResponseDTO resolveIssue(Long issueId, String resolutionNotes);
    IssueResponseDTO closeIssue(Long issueId, Long userId);
    IssueResponseDTO updateIssue(Long id, IssueRequestDTO issueRequestDTO);
    void deleteIssue(Long id);
    void sendIssueNotification(Long issueId, String title, String message, String type);
    Page<IssueResponseDTO> searchIssues(String title, String description, String status, 
        String priority, String type, Long reportedById, Long assignedToId, Long assetId, Pageable pageable);
}