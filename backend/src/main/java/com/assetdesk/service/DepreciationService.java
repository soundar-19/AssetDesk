package com.assetdesk.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public interface DepreciationService {
    Map<String, Object> getDepreciation(Long assetId, LocalDate asOfDate);
}


