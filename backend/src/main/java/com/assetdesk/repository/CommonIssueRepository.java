package com.assetdesk.repository;

import com.assetdesk.domain.CommonIssue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommonIssueRepository extends JpaRepository<CommonIssue, Long> {
    Page<CommonIssue> findByCategoryContainingIgnoreCase(String category, Pageable pageable);
    Page<CommonIssue> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}


