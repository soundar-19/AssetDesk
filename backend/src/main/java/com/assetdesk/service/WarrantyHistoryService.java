package com.assetdesk.service;

import com.assetdesk.domain.Asset;
import com.assetdesk.domain.WarrantyHistory;
import java.time.LocalDate;
import java.util.List;

public interface WarrantyHistoryService {
    WarrantyHistory record(Asset asset, LocalDate oldDate, LocalDate newDate, String reason);
    List<WarrantyHistory> listByAsset(Long assetId);
}


