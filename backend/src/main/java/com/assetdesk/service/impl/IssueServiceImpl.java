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
    private final com.assetdesk.repository.MessageRepository messageRepository;
    
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
        return issueRepository.findByReportedById(userId, pageable)
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
        System.out.println("=== ASSIGN ISSUE DEBUG ===");
        System.out.println("Issue ID: " + issueId + ", Assigned To ID: " + assignedToId);
        
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
        
        System.out.println("Found issue: " + issue.getTitle());
        System.out.println("Current assigned to: " + (issue.getAssignedTo() != null ? issue.getAssignedTo().getName() : "null"));
        
        var assignedUser = userRepository.findById(assignedToId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", assignedToId));
        
        System.out.println("Found user to assign: " + assignedUser.getName());
        
        issue.setAssignedTo(assignedUser);
        issue.setStatus(Issue.Status.IN_PROGRESS);
        
        System.out.println("Before save - assigned to: " + issue.getAssignedTo().getName());
        
        Issue updatedIssue = issueRepository.save(issue);
        
        System.out.println("After save - assigned to: " + (updatedIssue.getAssignedTo() != null ? updatedIssue.getAssignedTo().getName() : "null"));
        
        IssueResponseDTO dto = IssueResponseDTO.fromEntity(updatedIssue);
        System.out.println("DTO assigned to name: " + dto.getAssignedToName());
        System.out.println("DTO assigned to ID: " + dto.getAssignedToId());
        
        // Add system message for status change
        try {
            addSystemMessage(issueId, "Issue assigned to " + assignedUser.getName() + " and status changed to In Progress");
        } catch (Exception e) {
            System.out.println("Failed to add system message: " + e.getMessage());
        }
        
        // Create notification for assignment
        try {
            // Also notify the reporter
            if (updatedIssue.getReportedBy() != null && !updatedIssue.getReportedBy().getId().equals(assignedToId)) {
                notificationService.createNotification(
                    updatedIssue.getReportedBy().getId(),
                    "Issue In Progress",
                    "Your issue '" + updatedIssue.getTitle() + "' is now being worked on by " + assignedUser.getName(),
                    com.assetdesk.domain.Notification.Type.INFO,
                    updatedIssue.getId(),
                    updatedIssue.getAsset().getId()
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to create assignment notification: " + e.getMessage());
        }
        
        return dto;
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
            serviceRecord.setServiceDescription(resolutionNotes != null ? resolutionNotes : "Issue resolution service");
            serviceRecord.setServiceType("ISSUE_RESOLUTION");
            serviceRecord.setPerformedBy(resolvedIssue.getAssignedTo() != null ? resolvedIssue.getAssignedTo().getName() : "IT Support");
            serviceRecord.setStatus("COMPLETED");
            serviceRecord.setNotes("Resolved issue: " + resolvedIssue.getTitle() + " (ID: " + resolvedIssue.getId() + ")");
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
    public IssueResponseDTO resolveIssue(Long issueId, String resolutionNotes, Double cost) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
        
        issue.setStatus(Issue.Status.RESOLVED);
        issue.setResolutionNotes(resolutionNotes);
        issue.setResolutionCost(cost);
        issue.setResolvedAt(LocalDateTime.now());
        
        Issue resolvedIssue = issueRepository.save(issue);
        
        // Add system message for resolution
        try {
            String systemMessage = "Issue resolved";
            if (resolutionNotes != null && !resolutionNotes.trim().isEmpty()) {
                systemMessage += ": " + resolutionNotes;
            }
            if (cost != null && cost > 0) {
                systemMessage += " (Cost: $" + String.format("%.2f", cost) + ")";
            }
            addSystemMessage(issueId, systemMessage);
        } catch (Exception e) {
            System.out.println("Failed to add system message: " + e.getMessage());
        }
        
        // Create service record for issue resolution
        try {
            ServiceRecord serviceRecord = new ServiceRecord();
            serviceRecord.setAsset(resolvedIssue.getAsset());
            serviceRecord.setServiceDate(resolvedIssue.getResolvedAt().toLocalDate());
            serviceRecord.setServiceDescription(resolutionNotes != null ? resolutionNotes : "Issue resolution service");
            serviceRecord.setServiceType("ISSUE_RESOLUTION");
            serviceRecord.setPerformedBy(resolvedIssue.getAssignedTo() != null ? resolvedIssue.getAssignedTo().getName() : "IT Support");
            if (cost != null) {
                serviceRecord.setServiceCost(java.math.BigDecimal.valueOf(cost));
            }
            serviceRecord.setStatus("COMPLETED");
            serviceRecord.setNotes("Resolved issue: " + resolvedIssue.getTitle() + " (ID: " + resolvedIssue.getId() + ")");
            serviceRecordRepository.save(serviceRecord);
            System.out.println("Service record created for issue resolution with cost: " + cost);
        } catch (Exception e) {
            System.out.println("Failed to create service record: " + e.getMessage());
            e.printStackTrace();
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
        
        // Add system message for closure
        try {
            addSystemMessage(issueId, "Issue has been closed by " + user.getName());
        } catch (Exception e) {
            System.out.println("Failed to add system message: " + e.getMessage());
        }
        
        // Create notification for closure
        try {
            if (closedIssue.getAssignedTo() != null && !closedIssue.getAssignedTo().getId().equals(userId)) {
                notificationService.createNotification(
                    closedIssue.getAssignedTo().getId(),
                    "Issue Closed",
                    "Issue '" + closedIssue.getTitle() + "' has been closed",
                    com.assetdesk.domain.Notification.Type.INFO,
                    closedIssue.getId(),
                    closedIssue.getAsset().getId()
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to create closure notification: " + e.getMessage());
        }
        
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
    
    private void addSystemMessage(Long issueId, String messageText) {
        try {
            com.assetdesk.domain.Message message = new com.assetdesk.domain.Message();
            message.setIssue(issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId)));
            message.setMessageText(messageText);
            message.setIsSystemMessage(true);
            // Set system user as sender (assuming user ID 1 is system)
            message.setSender(userRepository.findById(1L)
                .orElse(null));
            messageRepository.save(message);
        } catch (Exception e) {
            System.out.println("Failed to add system message: " + e.getMessage());
        }
    }
}