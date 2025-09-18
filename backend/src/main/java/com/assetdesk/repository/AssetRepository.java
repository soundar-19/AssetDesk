package com.assetdesk.repository;

import com.assetdesk.domain.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {
    
    Optional<Asset> findByAssetTag(String assetTag);
    List<Asset> findByCategory(Asset.Category category);
    Page<Asset> findByCategory(Asset.Category category, Pageable pageable);
    List<Asset> findByType(Asset.AssetType type);
    Page<Asset> findByType(Asset.AssetType type, Pageable pageable);
    List<Asset> findByStatus(Asset.Status status);
    Page<Asset> findByStatus(Asset.Status status, Pageable pageable);
    List<Asset> findByVendorId(Long vendorId);
    Page<Asset> findByVendorId(Long vendorId, Pageable pageable);
    
    @Query("SELECT a FROM Asset a LEFT JOIN FETCH a.vendor WHERE a.status = 'AVAILABLE'")
    List<Asset> findAvailableAssets();
    
    @Query("SELECT a FROM Asset a LEFT JOIN FETCH a.vendor WHERE a.status = 'AVAILABLE'")
    Page<Asset> findAvailableAssets(Pageable pageable);
    
    @Query("SELECT a FROM Asset a LEFT JOIN FETCH a.vendor JOIN AssetAllocation al ON a.id = al.asset.id WHERE al.user.id = ?1 AND al.returnedDate IS NULL")
    Page<Asset> findAssetsByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT a.name as name, COUNT(a) as count FROM Asset a GROUP BY a.name ORDER BY COUNT(a) DESC")
    List<Object[]> findAssetGroups();
    
    @Query("SELECT a.name, " +
           "COUNT(a) as total, " +
           "SUM(CASE WHEN a.status = 'AVAILABLE' THEN 1 ELSE 0 END) as available, " +
           "SUM(CASE WHEN a.status = 'ALLOCATED' THEN 1 ELSE 0 END) as allocated, " +
           "SUM(CASE WHEN a.status = 'MAINTENANCE' THEN 1 ELSE 0 END) as maintenance, " +
           "SUM(CASE WHEN a.status = 'RETIRED' THEN 1 ELSE 0 END) as retired, " +
           "MIN(a.model) as model, " +
           "MIN(a.category) as category, " +
           "MIN(a.type) as type, " +
           "MIN(v.name) as vendor " +
           "FROM Asset a LEFT JOIN a.vendor v " +
           "GROUP BY a.name " +
           "ORDER BY COUNT(a) DESC")
    List<Object[]> findAssetGroupsWithDetails();
    
    @Query("SELECT a FROM Asset a WHERE a.name LIKE %?1%")
    Page<Asset> findByName(String name, Pageable pageable);
    
    Page<Asset> findAll(Pageable pageable);

    Page<Asset> findByWarrantyExpiryDateBetween(java.time.LocalDate start, java.time.LocalDate end, Pageable pageable);
    
    @Query("SELECT COUNT(a) FROM Asset a WHERE a.warrantyExpiryDate IS NOT NULL")
    long countAssetsWithWarranty();
    
    @Query("SELECT COUNT(a) FROM Asset a WHERE a.warrantyExpiryDate < CURRENT_DATE")
    long countExpiredWarranties();
    
    @Query("SELECT COUNT(a) FROM Asset a WHERE a.warrantyExpiryDate BETWEEN CURRENT_DATE AND :endDate")
    long countWarrantiesExpiringBefore(java.time.LocalDate endDate);
    
    @Query("SELECT a FROM Asset a WHERE a.warrantyExpiryDate < CURRENT_DATE ORDER BY a.warrantyExpiryDate DESC")
    Page<Asset> findExpiredWarranties(Pageable pageable);
    
    @Query("SELECT a FROM Asset a WHERE a.warrantyExpiryDate >= CURRENT_DATE ORDER BY a.warrantyExpiryDate ASC")
    Page<Asset> findValidWarranties(Pageable pageable);
    
    // Dashboard specific queries
    @Query("SELECT a FROM Asset a LEFT JOIN FETCH a.vendor JOIN AssetAllocation al ON a.id = al.asset.id WHERE al.user.id = ?1 AND al.returnedDate IS NULL")
    List<Asset> findByCurrentUserId(Long userId);
    
    @Query("SELECT COUNT(a) FROM Asset a JOIN AssetAllocation al ON a.id = al.asset.id WHERE al.user.id = ?1 AND al.returnedDate IS NULL")
    Long countByCurrentUserId(Long userId);
    
    @Query("SELECT COUNT(a) FROM Asset a WHERE a.status = ?1")
    Long countByStatus(Asset.Status status);
    
    @Query("SELECT COUNT(a) FROM Asset a WHERE a.purchaseDate BETWEEN ?1 AND ?2")
    Long countByPurchaseDateBetween(LocalDate start, LocalDate end);
    
    @Query("SELECT a FROM Asset a LEFT JOIN FETCH a.vendor WHERE a.id = ?1")
    Optional<Asset> findByIdWithVendor(Long id);
}