package com.assetdesk.dto.notification;

import com.assetdesk.domain.Notification;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponseDTO {
    
    private Long id;
    private String title;
    private String message;
    private Notification.Type type;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Long relatedIssueId;
    private Long relatedAssetId;
    
    public static NotificationResponseDTO fromEntity(Notification notification) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRelatedIssueId(notification.getRelatedIssueId());
        dto.setRelatedAssetId(notification.getRelatedAssetId());
        return dto;
    }
}