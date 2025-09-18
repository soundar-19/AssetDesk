package com.assetdesk.service.impl;

import com.assetdesk.dto.notification.NotificationResponseDTO;
import com.assetdesk.domain.Notification;
import com.assetdesk.repository.NotificationRepository;
import com.assetdesk.repository.UserRepository;
import com.assetdesk.service.NotificationService;
import com.assetdesk.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    @Override
    public void createNotification(Long userId, String title, String message, Notification.Type type) {
        createNotification(userId, title, message, type, null, null);
    }
    
    @Override
    public void createNotification(Long userId, String title, String message, Notification.Type type, Long relatedIssueId, Long relatedAssetId) {
        var userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            System.out.println("Cannot create notification: User not found with id: " + userId);
            return;
        }
        
        Notification notification = new Notification();
        notification.setUser(userOptional.get());
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedIssueId(relatedIssueId);
        notification.setRelatedAssetId(relatedAssetId);
        
        notificationRepository.save(notification);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> getAllNotifications(Pageable pageable) {
        return notificationRepository.findAll(pageable)
            .map(NotificationResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(NotificationResponseDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getUnreadNotificationsByUser(Long userId) {
        return notificationRepository.findUnreadNotificationsByUserId(userId).stream()
            .map(NotificationResponseDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countUnreadNotificationsByUserId(userId);
    }
    
    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findUnreadNotificationsByUserId(userId);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }
    
    @Override
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> getNotificationsByUserPaged(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(NotificationResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> getUnreadNotificationsByUserPaged(Long userId, Pageable pageable) {
        return notificationRepository.findUnreadNotificationsByUserId(userId, pageable)
            .map(NotificationResponseDTO::fromEntity);
    }
}