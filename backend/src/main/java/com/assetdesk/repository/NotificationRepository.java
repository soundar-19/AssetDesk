package com.assetdesk.repository;

import com.assetdesk.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(Long userId, Boolean isRead);
    List<Notification> findByType(Notification.Type type);
    
    @Query("SELECT n FROM Notification n WHERE n.user.id = ?1 AND n.isRead = false")
    List<Notification> findUnreadNotificationsByUserId(Long userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = ?1 AND n.isRead = false")
    Long countUnreadNotificationsByUserId(Long userId);
}