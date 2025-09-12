package com.assetdesk.repository;

import com.assetdesk.domain.WarrantyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface WarrantyHistoryRepository extends JpaRepository<WarrantyHistory, Long> {
    List<WarrantyHistory> findByAssetIdOrderByChangedAtDesc(Long assetId);
    
    // Dashboard specific queries
    @Query("SELECT wh FROM WarrantyHistory wh WHERE wh.newExpiryDate BETWEEN CURRENT_DATE AND :endDate ORDER BY wh.newExpiryDate ASC")
    List<WarrantyHistory> findWarrantiesExpiringBetween(@Param("endDate") LocalDate endDate);
    
    @Query("SELECT wh FROM WarrantyHistory wh JOIN AssetAllocation aa ON wh.asset.id = aa.asset.id WHERE aa.user.id = :userId AND aa.returnedDate IS NULL AND wh.newExpiryDate BETWEEN CURRENT_DATE AND :endDate ORDER BY wh.newExpiryDate ASC")
    List<WarrantyHistory> findWarrantiesExpiringBetweenByUserId(@Param("endDate") LocalDate endDate, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(wh) FROM WarrantyHistory wh WHERE wh.newExpiryDate BETWEEN CURRENT_DATE AND :endDate")
    Long countWarrantiesExpiringBetween(@Param("endDate") LocalDate endDate);
}


