package com.assetdesk.service.impl;

import com.assetdesk.dto.issue.IssueRequestDTO;
import com.assetdesk.dto.issue.IssueResponseDTO;
import com.assetdesk.domain.Issue;
import com.assetdesk.repository.IssueRepository;
import com.assetdesk.repository.AssetRepository;
import com.assetdesk.repository.UserRepository;
import com.assetdesk.repository.ServiceRecordRepository;
import com.assetdesk.service.IssueService;
import com.assetdesk.service.NotificationService;
import com.assetdesk.domain.ServiceRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Locale;
import com.assetdesk.exception.ResourceNotFoundException;
import org.springframework.data.jpa.domain.Specification;
import static com.assetdesk.spec.IssueSpecifications.*;

@Service
@RequiredArgsConstructor
@Transactional
public class IssueServiceImpl implements IssueService {
    
    private final IssueRepository issueRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ServiceRecordRepository serviceRecordRepository;
    
    @Override
    public IssueResponseDTO createIssue(IssueRequestDTO issueRequestDTO, Long reportedById) {
        try {
            if (reportedById == null) {
                throw new IllegalArgumentException("Reported by ID cannot be null");
            }
            if (issueRequestDTO.getAssetId() == null) {
                throw new IllegalArgumentException("Asset ID cannot be null");
            }
            
            System.out.println("Creating issue entity...");
            Issue issue = new Issue();
            issue.setTitle(issueRequestDTO.getTitle());
            issue.setDescription(issueRequestDTO.getDescription());
            issue.setPriority(issueRequestDTO.getPriority());
            issue.setType(issueRequestDTO.getType());
            issue.setStatus(Issue.Status.OPEN);
            
            System.out.println("Finding user with ID: " + reportedById);
            var user = userRepository.findById(reportedById)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reportedById));
            System.out.println("Found user: " + user.getId() + " - " + user.getName());
            issue.setReportedBy(user);
            
            System.out.println("Finding asset with ID: " + issueRequestDTO.getAssetId());
            var asset = assetRepository.findById(issueRequestDTO.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", issueRequestDTO.getAssetId()));
            System.out.println("Found asset: " + asset.getId() + " - " + asset.getName());
            issue.setAsset(asset);
            
            System.out.println("Saving issue...");
            Issue savedIssue = issueRepository.save(issue);
            System.out.println("Issue saved with ID: " + savedIssue.getId());
            
            // Create notification for issue creation
            try {
                notificationService.createNotification(
                    reportedById,
                    "New Issue Created",
                    "Issue '" + savedIssue.getTitle() + "' has been created for asset " + asset.getName(),
                    com.assetdesk.domain.Notification.Type.INFO,
                    savedIssue.getId(),
                    asset.getId()
                );
                System.out.println("Notification created for issue: " + savedIssue.getId());
            } catch (Exception e) {
                System.out.println("Failed to create notification: " + e.getMessage());
            }
            
            return IssueResponseDTO.fromEntity(savedIssue);
        } catch (Exception e) {
            System.out.println("Error creating issue: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public IssueResponseDTO getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));
        return IssueResponseDTO.fromEntity(issue);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponseDTO> getAllIssues(Pageable pageable) {
        return issueRepository.findAllExcludingClosed(pageable)
            .map(IssueResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponseDTO> getAllIssuesIncludingClosed(Pageable pageable) {
        return issueRepository.findAll(pageable)
            .map(IssueResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponseDTO> getIssuesByReportedBy(Long userId, Pageable pageable) {
        return issueRepository.findByReportedByIdExcludingClosed(userId, pageable)
            .map(IssueResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponseDTO> getIssuesByAssignedTo(Long userId, Pageable pageable) {
        return issueRepository.findByAssignedToIdExcludingClosed(userId, pageable)
            .map(IssueResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponseDTO> getIssuesByAsset(Long assetId, Pageable pageable) {
        return issueRepository.findByAssetIdExcludingClosed(assetId, pageable)
            .map(IssueResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponseDTO> getIssuesByStatus(String status, Pageable pageable) {
        Issue.Status issueStatus = Issue.Status.valueOf(status.toUpperCase(Locale.ROOT));
        return issueRepository.findByStatus(issueStatus, pageable)
            .map(IssueResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponseDTO> getActiveIssues(Pageable pageable) {
        return issueRepository.findActiveIssues(pageable)
            .map(IssueResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponseDTO> getUnassignedIssues(Pageable pageable) {
        return issueRepository.findUnassignedIssues(pageable)
            .map(IssueResponseDTO::fromEntity);
    }
    
    @Override
    public IssueResponseDTO assignIssue(Long issueId, Long assignedToId) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
        
        issue.setAssignedTo(userRepository.findById(assignedToId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", assignedToId)));
        issue.setStatus(Issue.Status.IN_PROGRESS);
        
        Issue updatedIssue = issueRepository.save(issue);
        
        // Create notification for assignment
        try {
            notificationService.createNotification(
                assignedToId,
                "Issue Assigned",
                "Issue '" + updatedIssue.getTitle() + "' has been assigned to you",
                com.assetdesk.domain.Notification.Type.INFO,
                updatedIssue.getId(),
                updatedIssue.getAsset().getId()
            );
        } catch (Exception e) {
            System.out.println("Failed to create assignment notification: " + e.getMessage());
        }
        
        return IssueResponseDTO.fromEntity(updatedIssue);
    }
    
    @Override
    public IssueResponseDTO unassignIssue(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
        issue.setAssignedTo(null);
        Issue updated = issueRepository.save(issue);
        return IssueResponseDTO.fromEntity(updated);
    }

    @Override
    public IssueResponseDTO updateStatus(Long issueId, String status) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
        Issue.Status newStatus = Issue.Status.valueOf(status.toUpperCase(Locale.ROOT));
        issue.setStatus(newStatus);
        if (newStatus == Issue.Status.RESOLVED) {
            issue.setResolvedAt(LocalDateTime.now());
        }
        return IssueResponseDTO.fromEntity(issueRepository.save(issue));
    }

    @Override
    public IssueResponseDTO updatePriority(Long issueId, String priority) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
        issue.setPriority(Issue.Priority.valueOf(priority.toUpperCase(Locale.ROOT)));
        return IssueResponseDTO.fromEntity(issueRepository.save(issue));
    }

    
    @Override
    public IssueResponseDTO resolveIssue(Long issueId, String resolutionNotes) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
        
        issue.setStatus(Issue.Status.RESOLVED);
        issue.setResolutionNotes(resolutionNotes);
        issue.setResolvedAt(LocalDateTime.now());
        
        Issue resolvedIssue = issueRepository.save(issue);
        
        // Create service record for issue resolution
        try {
            ServiceRecord serviceRecord = new ServiceRecord();
            serviceRecord.setAsset(resolvedIssue.getAsset());
            serviceRecord.setServiceDate(resolvedIssue.getResolvedAt().toLocalDate());
            serviceRecord.setServiceDescription("Issue resolved: " + resolvedIssue.getTitle() + 
                (resolutionNotes != null ? ". Resolution: " + resolutionNotes : ""));
            serviceRecordRepository.save(serviceRecord);
        } catch (Exception e) {
            System.out.println("Failed to create service record: " + e.getMessage());
        }
        
        // Create notification for resolution
        try {
            if (resolvedIssue.getReportedBy() != null) {
                notificationService.createNotification(
                    resolvedIssue.getReportedBy().getId(),
                    "Issue Resolved",
                    "Your issue '" + resolvedIssue.getTitle() + "' has been resolved",
                    com.assetdesk.domain.Notification.Type.SUCCESS,
                    resolvedIssue.getId(),
                    resolvedIssue.getAsset().getId()
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to create resolution notification: " + e.getMessage());
        }
        
        return IssueResponseDTO.fromEntity(resolvedIssue);
    }
    
    @Override
    public IssueResponseDTO closeIssue(Long issueId, Long userId) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
        
        if (issue.getStatus() != Issue.Status.RESOLVED) {
            throw new IllegalStateException("Only resolved issues can be closed");
        }
        
        // Get the user to check their role
        var user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Allow issue reporter or IT_SUPPORT to close the issue
        boolean canClose = issue.getReportedBy().getId().equals(userId) || 
                          user.getRole() == com.assetdesk.domain.User.Role.IT_SUPPORT;
        
        if (!canClose) {
            throw new IllegalStateException("Only the user who reported the issue or IT Support can close it");
        }
        
        issue.setStatus(Issue.Status.CLOSED);
        Issue closedIssue = issueRepository.save(issue);
        
        return IssueResponseDTO.fromEntity(closedIssue);
    }
    
    @Override
    public IssueResponseDTO updateIssue(Long id, IssueRequestDTO issueRequestDTO) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));
        
        issue.setTitle(issueRequestDTO.getTitle());
        issue.setDescription(issueRequestDTO.getDescription());
        issue.setType(issueRequestDTO.getType());
        issue.setPriority(issueRequestDTO.getPriority());
        
        if (issueRequestDTO.getAssetId() != null && !issueRequestDTO.getAssetId().equals(issue.getAsset().getId())) {
            var asset = assetRepository.findById(issueRequestDTO.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", issueRequestDTO.getAssetId()));
            issue.setAsset(asset);
        }
        
        Issue updatedIssue = issueRepository.save(issue);
        return IssueResponseDTO.fromEntity(updatedIssue);
    }
    
    @Override
    public void deleteIssue(Long id) {
        issueRepository.deleteById(id);
    }
    
    @Override
    public void sendIssueNotification(Long issueId, String title, String message, String type) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
        
        // Send notification to issue reporter
        if (issue.getReportedBy() != null) {
            notificationService.createNotification(
                issue.getReportedBy().getId(), 
                title, 
                message, 
                com.assetdesk.domain.Notification.Type.valueOf(type), 
                issueId, 
                null
            );
        }
        
        // Also send to assigned user if different and exists
        if (issue.getAssignedTo() != null && !issue.getAssignedTo().getId().equals(issue.getReportedBy().getId())) {
            notificationService.createNotification(
                issue.getAssignedTo().getId(), 
                title, 
                message, 
                com.assetdesk.domain.Notification.Type.valueOf(type), 
                issueId, 
                null
            );
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<IssueResponseDTO> searchIssues(String title, String description, String status, 
            String priority, String type, Long reportedById, Long assignedToId, Long assetId, Pageable pageable) {
        Specification<Issue> spec = Specification.where(null);
        
        // Check if this is a global search (same term in title and description)
        boolean isGlobalSearch = title != null && title.equals(description);
        
        if (isGlobalSearch) {
            spec = spec.and(hasGlobalSearch(title));
        } else {
            // Individual field searches
            spec = spec.and(hasTitleLike(title))
                .and(hasDescriptionLike(description));
        }
        
        spec = spec.and(hasStatus(status))
            .and(hasPriority(priority))
            .and(hasType(type))
            .and(hasReportedBy(reportedById))
            .and(hasAssignedTo(assignedToId))
            .and(hasAsset(assetId));
            
        return issueRepository.findAll(spec, pageable).map(IssueResponseDTO::fromEntity);
    }
}