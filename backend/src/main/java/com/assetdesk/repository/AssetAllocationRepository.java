package com.assetdesk.repository;

import com.assetdesk.domain.AssetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, Long> {
    
    List<AssetAllocation> findByAssetId(Long assetId);
    List<AssetAllocation> findByUserId(Long userId);
    
    @Query("SELECT aa FROM AssetAllocation aa WHERE aa.asset.id = ?1 AND aa.returnedDate IS NULL")
    Optional<AssetAllocation> findCurrentAllocationByAssetId(Long assetId);
    
    @Query("SELECT aa FROM AssetAllocation aa WHERE aa.user.id = ?1 AND aa.returnedDate IS NULL")
    List<AssetAllocation> findCurrentAllocationsByUserId(Long userId);
    
    @Query("SELECT aa FROM AssetAllocation aa WHERE aa.returnedDate IS NULL")
    List<AssetAllocation> findCurrentAllocations();
    
    Page<AssetAllocation> findByReturnedDateIsNull(Pageable pageable);
    Page<AssetAllocation> findByReturnedDateIsNotNull(Pageable pageable);
    long countByReturnedDateIsNull();
    
    // Dashboard specific queries
    List<AssetAllocation> findTop5ByOrderByAllocatedDateDesc();
    
    List<AssetAllocation> findTop5ByUserIdOrderByAllocatedDateDesc(Long userId);
    
    @Query("SELECT COUNT(aa) FROM AssetAllocation aa WHERE aa.user.id = ?1 AND aa.returnedDate IS NULL")
    Long countCurrentAllocationsByUserId(Long userId);
    
    @Query("SELECT aa FROM AssetAllocation aa WHERE aa.returnedDate IS NULL ORDER BY aa.allocatedDate DESC")
    List<AssetAllocation> findTop10ByReturnedDateIsNullOrderByAllocatedDateDesc();
    
    @Query("SELECT aa FROM AssetAllocation aa WHERE aa.user.id = ?1 AND aa.returnedDate IS NULL ORDER BY aa.allocatedDate DESC")
    List<AssetAllocation> findTop10ByUserIdAndReturnedDateIsNullOrderByAllocatedDateDesc(Long userId);
}