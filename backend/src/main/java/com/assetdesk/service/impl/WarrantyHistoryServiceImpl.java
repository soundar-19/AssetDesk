package com.assetdesk.service.impl;

import com.assetdesk.domain.Asset;
import com.assetdesk.domain.WarrantyHistory;
import com.assetdesk.repository.WarrantyHistoryRepository;
import com.assetdesk.service.WarrantyHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WarrantyHistoryServiceImpl implements WarrantyHistoryService {

    private final WarrantyHistoryRepository repository;

    @Override
    public WarrantyHistory record(Asset asset, LocalDate oldDate, LocalDate newDate, String reason) {
        WarrantyHistory wh = new WarrantyHistory();
        wh.setAsset(asset);
        wh.setOldExpiryDate(oldDate);
        wh.setNewExpiryDate(newDate);
        wh.setReason(reason);
        return repository.save(wh);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyHistory> listByAsset(Long assetId) {
        return repository.findByAssetIdOrderByChangedAtDesc(assetId);
    }
}


