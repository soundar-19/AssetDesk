package com.assetdesk.service;

import com.assetdesk.dto.asset.AssetRequestDTO;
import com.assetdesk.dto.asset.AssetResponseDTO;
import com.assetdesk.dto.asset.AssetGroupResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AssetService {
    
    AssetResponseDTO createAsset(AssetRequestDTO assetRequestDTO);
    AssetResponseDTO getAssetById(Long id);
    AssetResponseDTO getAssetByTag(String assetTag);
    Page<AssetResponseDTO> getAllAssets(Pageable pageable);
    Page<AssetResponseDTO> getAssetsByCategory(String category, Pageable pageable);
    Page<AssetResponseDTO> getAssetsByStatus(String status, Pageable pageable);
    Page<AssetResponseDTO> getAvailableAssets(Pageable pageable);
    Page<AssetResponseDTO> getAssetsByUser(Long userId, Pageable pageable);
    List<AssetGroupResponseDTO> getAssetGroups();
    Page<AssetResponseDTO> getAssetsByName(String name, Pageable pageable);
    AssetResponseDTO updateAsset(Long id, AssetRequestDTO assetRequestDTO);
    void deleteAsset(Long id);
    AssetResponseDTO allocateAsset(Long assetId, Long userId, String remarks);
    AssetResponseDTO allocateAssetByEmployeeId(Long assetId, String employeeId, String remarks);
    AssetResponseDTO returnAsset(Long assetId, String remarks);
    Page<AssetResponseDTO> getWarrantyExpiring(int days, Pageable pageable);
    Page<AssetResponseDTO> search(String name, String category, String type, String status, Pageable pageable);
    Page<AssetResponseDTO> searchAdvanced(String name, String category, String type, String status, 
        String assetTag, String model, String serialNumber, String vendor, Pageable pageable);
    com.assetdesk.dto.asset.AssetGroupSummaryDTO getGroupSummary(String name);
    com.assetdesk.dto.asset.AssetResponseDTO allocateFromGroup(String name, Long userId, String remarks);
    com.assetdesk.dto.asset.AssetResponseDTO allocateFromGroupByEmployeeId(String name, String employeeId, String remarks);
    com.assetdesk.dto.asset.WarrantyStatsDTO getWarrantyStats();
    Page<AssetResponseDTO> getExpiredWarranties(Pageable pageable);
    Page<AssetResponseDTO> getValidWarranties(Pageable pageable);
    long getFilteredCount(String category, String type, String status, String dateFrom, String dateTo, String costMin, String costMax);
}