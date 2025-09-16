package com.assetdesk.repository;

import com.assetdesk.domain.ServiceRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.math.BigDecimal;

@Repository
public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, Long> {
    
    List<ServiceRecord> findByAssetIdOrderByServiceDateDesc(Long assetId);
    

    
    @Query("SELECT COALESCE(SUM(COALESCE(sr.serviceCost, sr.cost)), 0) FROM ServiceRecord sr WHERE sr.asset.id = ?1")
    BigDecimal getTotalServiceCostByAssetId(Long assetId);
    
    @Query("SELECT COUNT(sr) FROM ServiceRecord sr WHERE sr.asset.id = ?1")
    Long getServiceCountByAssetId(Long assetId);
    
    // Dashboard specific queries
    @Query("SELECT COUNT(DISTINCT sr.asset.id) FROM ServiceRecord sr WHERE sr.nextServiceDate <= CURRENT_DATE")
    Long countAssetsNeedingMaintenance();
    
    @Query("SELECT sr FROM ServiceRecord sr LEFT JOIN FETCH sr.asset LEFT JOIN FETCH sr.vendor")
    List<ServiceRecord> findAllWithAssetAndVendor();
    
    @Query(value = "SELECT sr FROM ServiceRecord sr LEFT JOIN FETCH sr.asset LEFT JOIN FETCH sr.vendor",
           countQuery = "SELECT COUNT(sr) FROM ServiceRecord sr")
    Page<ServiceRecord> findAllWithAssetAndVendor(Pageable pageable);
    
    @Query("SELECT sr FROM ServiceRecord sr LEFT JOIN FETCH sr.asset LEFT JOIN FETCH sr.vendor WHERE sr.id = :id")
    java.util.Optional<ServiceRecord> findByIdWithAssetAndVendor(@org.springframework.data.repository.query.Param("id") Long id);
    
    @Query(value = "SELECT sr FROM ServiceRecord sr LEFT JOIN FETCH sr.asset LEFT JOIN FETCH sr.vendor " +
           "WHERE sr.serviceType != 'ASSET_ALLOCATION' AND " +
           "(sr.serviceDescription NOT LIKE '%allocated to%' AND " +
           "sr.serviceDescription NOT LIKE '%returned by%' AND " +
           "sr.serviceDescription NOT LIKE '%Asset allocated%' AND " +
           "sr.serviceDescription NOT LIKE '%Asset returned%')",
           countQuery = "SELECT COUNT(sr) FROM ServiceRecord sr " +
           "WHERE sr.serviceType != 'ASSET_ALLOCATION' AND " +
           "(sr.serviceDescription NOT LIKE '%allocated to%' AND " +
           "sr.serviceDescription NOT LIKE '%returned by%' AND " +
           "sr.serviceDescription NOT LIKE '%Asset allocated%' AND " +
           "sr.serviceDescription NOT LIKE '%Asset returned%')")
    Page<ServiceRecord> findAllServiceRecordsExcludingAllocations(Pageable pageable);
}