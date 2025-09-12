package com.assetdesk.dto.issue;

import com.assetdesk.domain.Issue;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class IssueResponseDTO {
    
    private Long id;
    private String title;
    private String description;
    private String type;
    private String reportedByName;
    private Long reportedById;
    private String assetTag;
    private String assignedToName;
    private Long assignedToId;
    private String status;
    private String priority;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String resolutionNotes;
    private Boolean replacementOffered;
    
    public static IssueResponseDTO fromEntity(Issue issue) {
        IssueResponseDTO dto = new IssueResponseDTO();
        dto.setId(issue.getId());
        dto.setTitle(issue.getTitle());
        dto.setDescription(issue.getDescription());
        dto.setType(issue.getType().name());
        dto.setReportedByName(issue.getReportedBy().getName());
        dto.setReportedById(issue.getReportedBy().getId());
        dto.setAssetTag(issue.getAsset().getAssetTag());
        dto.setAssignedToName(issue.getAssignedTo() != null ? issue.getAssignedTo().getName() : null);
        dto.setAssignedToId(issue.getAssignedTo() != null ? issue.getAssignedTo().getId() : null);
        dto.setStatus(issue.getStatus().name());
        dto.setPriority(issue.getPriority().name());
        dto.setCreatedAt(issue.getCreatedAt());
        dto.setResolvedAt(issue.getResolvedAt());
        dto.setResolutionNotes(issue.getResolutionNotes());
        dto.setReplacementOffered(issue.getReplacementOffered());
        return dto;
    }
}