package com.assetdesk.service;

import com.assetdesk.domain.AssetAllocation;
import java.util.List;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssetAllocationService {
    
    AssetAllocation allocateAsset(Long assetId, Long userId, LocalDate allocatedDate, String remarks);
    AssetAllocation returnAsset(Long assetId, LocalDate returnedDate, String remarks);
    AssetAllocation returnAssetFromUser(Long assetId, Long userId, LocalDate returnedDate, String remarks);
    List<AssetAllocation> getAllocationHistory(Long assetId);
    List<AssetAllocation> getUserAllocations(Long userId);
    Page<AssetAllocation> getAllAllocations(Pageable pageable);
    Page<AssetAllocation> getAllAllocations(Pageable pageable, String status, String search);
    Object getAnalytics();
    List<AssetAllocation> getCurrentAllocations();
    AssetAllocation getCurrentAllocation(Long assetId);
    Page<AssetAllocation> getActiveAllocations(Pageable pageable);
    AssetAllocation requestReturn(Long assetId, String remarks);
    List<AssetAllocation> getUserAllocationsWithHistory(Long userId);
    List<AssetAllocation> getAssetAllocationsWithHistory(Long assetId);
    AssetAllocation acknowledgeReturnRequest(Long assetId, Long userId);
    List<AssetAllocation> getUserReturnRequests(Long userId);
    List<AssetAllocation> getPendingReturns();
    List<Long> getAllocatedUserIds(Long assetId);
}