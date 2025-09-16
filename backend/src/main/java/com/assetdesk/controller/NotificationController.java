package com.assetdesk.controller;

import com.assetdesk.dto.notification.NotificationResponseDTO;
import com.assetdesk.service.NotificationService;
import com.assetdesk.domain.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @PostMapping
    public ResponseEntity<Void> createNotification(@RequestBody CreateNotificationRequest request) {
        if (request.getUserId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Notification.Type notificationType = Notification.Type.valueOf(request.getType().toUpperCase());
        notificationService.createNotification(request.getUserId(), request.getTitle(), request.getMessage(), notificationType, request.getRelatedIssueId(), request.getRelatedAssetId());
        return ResponseEntity.ok().build();
    }
    
    public static class CreateNotificationRequest {
        private Long userId;
        private String title;
        private String message;
        private String type;
        private Long relatedIssueId;
        private Long relatedAssetId;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Long getRelatedIssueId() { return relatedIssueId; }
        public void setRelatedIssueId(Long relatedIssueId) { this.relatedIssueId = relatedIssueId; }
        public Long getRelatedAssetId() { return relatedAssetId; }
        public void setRelatedAssetId(Long relatedAssetId) { this.relatedAssetId = relatedAssetId; }
    }
    
    @GetMapping
    public ResponseEntity<Page<NotificationResponseDTO>> getAllNotifications(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponseDTO> notifications;
        if (userId != null) {
            notifications = notificationService.getNotificationsByUserPaged(userId, pageable);
        } else {
            notifications = notificationService.getAllNotifications(pageable);
        }
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsByUser(@PathVariable Long userId) {
        List<NotificationResponseDTO> notifications = notificationService.getNotificationsByUser(userId);
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponseDTO>> getUnreadNotificationsByUser(@PathVariable Long userId) {
        List<NotificationResponseDTO> notifications = notificationService.getUnreadNotificationsByUser(userId);
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<Long> getUnreadNotificationCount(@PathVariable Long userId) {
        Long count = notificationService.getUnreadNotificationCount(userId);
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/test/{userId}")
    public ResponseEntity<Void> createTestNotification(@PathVariable Long userId) {
        notificationService.createNotification(
            userId,
            "Test Notification",
            "This is a test notification to verify the system is working",
            Notification.Type.INFO
        );
        return ResponseEntity.ok().build();
    }
}