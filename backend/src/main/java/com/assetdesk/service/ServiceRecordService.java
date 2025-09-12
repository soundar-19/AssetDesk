package com.assetdesk.service;

import com.assetdesk.domain.ServiceRecord;
import com.assetdesk.dto.ServiceRecordRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.math.BigDecimal;

public interface ServiceRecordService {
    
    ServiceRecord createServiceRecord(ServiceRecordRequest request);
    ServiceRecord updateServiceRecord(Long id, ServiceRecordRequest request);
    ServiceRecord getServiceRecordById(Long id);
    Page<ServiceRecord> getAllServiceRecords(Pageable pageable);
    List<ServiceRecord> getServiceRecordsByAsset(Long assetId);
    BigDecimal getTotalServiceCost(Long assetId);
    Long getServiceCount(Long assetId);
    void deleteServiceRecord(Long id);
}