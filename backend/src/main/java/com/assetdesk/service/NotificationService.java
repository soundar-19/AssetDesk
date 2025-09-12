package com.assetdesk.service;

import com.assetdesk.dto.notification.NotificationResponseDTO;
import com.assetdesk.domain.Notification;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    
    void createNotification(Long userId, String title, String message, Notification.Type type);
    void createNotification(Long userId, String title, String message, Notification.Type type, Long relatedIssueId, Long relatedAssetId);
    Page<NotificationResponseDTO> getAllNotifications(Pageable pageable);
    List<NotificationResponseDTO> getNotificationsByUser(Long userId);
    List<NotificationResponseDTO> getUnreadNotificationsByUser(Long userId);
    Long getUnreadNotificationCount(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long id);
}