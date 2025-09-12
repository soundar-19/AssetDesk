package com.assetdesk.repository;

import com.assetdesk.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByIssueIdOrderByTimestampAsc(Long issueId);
    List<Message> findBySenderIdOrderByTimestampDesc(Long senderId);
    List<Message> findByIsSystemMessage(Boolean isSystemMessage);
    
    @Query("SELECT m FROM Message m WHERE m.issue.assignedTo.id = :userId ORDER BY m.timestamp DESC")
    Page<Message> findReceivedMessages(@Param("userId") Long userId, Pageable pageable);
    
    Page<Message> findBySenderIdOrderByTimestampDesc(Long senderId, Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE m.issue.assignedTo.id = :userId AND m.isRead = false ORDER BY m.timestamp DESC")
    Page<Message> findUnreadMessages(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.issue.assignedTo.id = :userId AND m.isRead = false")
    Long countUnreadMessages(@Param("userId") Long userId);
}