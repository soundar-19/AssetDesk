package com.assetdesk.dto.issue;

import com.assetdesk.domain.Issue;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class IssueRequestDTO {
    
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;
    
    @NotNull(message = "Asset ID is required")
    private Long assetId;
    
    @NotNull(message = "Priority is required")
    private Issue.Priority priority;
    
    @NotNull(message = "Issue type is required")
    private Issue.IssueType type;
    
    public Issue toEntity() {
        Issue issue = new Issue();
        issue.setTitle(this.title);
        issue.setDescription(this.description);
        issue.setPriority(this.priority);
        issue.setType(this.type);
        return issue;
    }
}