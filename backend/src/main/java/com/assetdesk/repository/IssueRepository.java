package com.assetdesk.repository;

import com.assetdesk.domain.Issue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {
    
    List<Issue> findByReportedById(Long userId);
    Page<Issue> findByReportedById(Long userId, Pageable pageable);
    
    List<Issue> findByAssignedToId(Long userId);
    Page<Issue> findByAssignedToId(Long userId, Pageable pageable);
    
    List<Issue> findByAssetId(Long assetId);
    Page<Issue> findByAssetId(Long assetId, Pageable pageable);
    
    List<Issue> findByStatus(Issue.Status status);
    Page<Issue> findByStatus(Issue.Status status, Pageable pageable);
    
    List<Issue> findByPriority(Issue.Priority priority);
    
    @Query("SELECT i FROM Issue i WHERE i.status IN ('OPEN', 'IN_PROGRESS')")
    List<Issue> findActiveIssues();
    
    @Query("SELECT i FROM Issue i WHERE i.status IN ('OPEN', 'IN_PROGRESS')")
    Page<Issue> findActiveIssues(Pageable pageable);
    
    @Query("SELECT i FROM Issue i WHERE i.assignedTo IS NULL AND i.status = 'OPEN'")
    List<Issue> findUnassignedIssues();
    
    @Query("SELECT i FROM Issue i WHERE i.assignedTo IS NULL AND i.status = 'OPEN'")
    Page<Issue> findUnassignedIssues(Pageable pageable);
    
    // Exclude closed issues by default
    @Query("SELECT i FROM Issue i WHERE i.status != 'CLOSED'")
    Page<Issue> findAllExcludingClosed(Pageable pageable);
    
    @Query("SELECT i FROM Issue i WHERE i.reportedBy.id = ?1 AND i.status != 'CLOSED'")
    Page<Issue> findByReportedByIdExcludingClosed(Long userId, Pageable pageable);
    
    @Query("SELECT i FROM Issue i WHERE i.assignedTo.id = ?1 AND i.status != 'CLOSED'")
    Page<Issue> findByAssignedToIdExcludingClosed(Long userId, Pageable pageable);
    
    @Query("SELECT i FROM Issue i WHERE i.asset.id = ?1 AND i.status != 'CLOSED'")
    Page<Issue> findByAssetIdExcludingClosed(Long assetId, Pageable pageable);
    
    // Dashboard specific queries
    Long countByReportedById(Long userId);
    
    @Query("SELECT COUNT(i) FROM Issue i WHERE i.status IN ?1")
    Long countByStatusIn(List<Issue.Status> statuses);
    
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    List<Issue> findTop5ByOrderByCreatedAtDesc();
    
    List<Issue> findTop5ByReportedByIdOrderByCreatedAtDesc(Long userId);
    
    List<Issue> findTop5ByStatusInOrderByPriorityDescCreatedAtDesc(List<String> statuses);
    
    List<Issue> findTop3ByReportedByIdAndStatusInOrderByPriorityDescCreatedAtDesc(Long userId, List<String> statuses);
    
    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FROM issues WHERE resolved_at IS NOT NULL", nativeQuery = true)
    Double getAverageResolutionTimeInHours();
    
    @Query("SELECT i FROM Issue i WHERE i.status IN ('OPEN', 'IN_PROGRESS') ORDER BY i.priority DESC, i.createdAt DESC")
    List<Issue> findTop10OpenIssuesOrderByPriorityDesc();
    
    @Query("SELECT i FROM Issue i WHERE i.reportedBy.id = ?1 AND i.status IN ('OPEN', 'IN_PROGRESS') ORDER BY i.priority DESC, i.createdAt DESC")
    List<Issue> findTop10ByReportedByIdAndOpenStatusOrderByPriorityDesc(Long userId);
}