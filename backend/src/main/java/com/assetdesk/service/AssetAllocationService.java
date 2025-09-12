package com.assetdesk.service;

import com.assetdesk.domain.AssetAllocation;
import java.util.List;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssetAllocationService {
    
    AssetAllocation allocateAsset(Long assetId, Long userId, LocalDate allocatedDate, String remarks);
    AssetAllocation returnAsset(Long assetId, LocalDate returnedDate, String remarks);
    List<AssetAllocation> getAllocationHistory(Long assetId);
    List<AssetAllocation> getUserAllocations(Long userId);
    Page<AssetAllocation> getAllAllocations(Pageable pageable);
    Page<AssetAllocation> getAllAllocations(Pageable pageable, String status, String search);
    Object getAnalytics();
    List<AssetAllocation> getCurrentAllocations();
    AssetAllocation getCurrentAllocation(Long assetId);
    Page<AssetAllocation> getActiveAllocations(Pageable pageable);
}