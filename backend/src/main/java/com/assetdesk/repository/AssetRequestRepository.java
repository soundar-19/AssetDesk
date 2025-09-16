package com.assetdesk.repository;

import com.assetdesk.domain.AssetRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssetRequestRepository extends JpaRepository<AssetRequest, Long> {
    Page<AssetRequest> findByRequestedById(Long requesterId, Pageable pageable);
    
    // Dashboard specific queries
    Long countByRequestedById(Long userId);
    
    Long countByRequestedByIdAndStatus(Long userId, AssetRequest.Status status);
    
    Long countByStatus(AssetRequest.Status status);
    
    List<AssetRequest> findTop5ByOrderByRequestedDateDesc();
    
    List<AssetRequest> findTop5ByRequestedByIdOrderByRequestedDateDesc(Long userId);
}


