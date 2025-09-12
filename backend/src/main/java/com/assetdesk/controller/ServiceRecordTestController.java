package com.assetdesk.controller;

import com.assetdesk.repository.ServiceRecordRepository;
import com.assetdesk.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test/service-records")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ServiceRecordTestController {
    
    private final ServiceRecordRepository serviceRecordRepository;
    private final AssetRepository assetRepository;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            long serviceRecordCount = serviceRecordRepository.count();
            long assetCount = assetRepository.count();
            
            return ResponseEntity.ok(Map.of(
                "status", "OK",
                "serviceRecordCount", serviceRecordCount,
                "assetCount", assetCount,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "ERROR",
                "error", e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }
    
    @GetMapping("/simple")
    public ResponseEntity<Map<String, Object>> simpleTest() {
        try {
            // Try to fetch first 5 service records without joins
            var records = serviceRecordRepository.findAll().stream()
                .limit(5)
                .map(record -> Map.of(
                    "id", record.getId(),
                    "serviceDate", record.getServiceDate(),
                    "serviceType", record.getServiceType() != null ? record.getServiceType() : "N/A",
                    "description", record.getServiceDescription() != null ? record.getServiceDescription() : "N/A"
                ))
                .toList();
            
            return ResponseEntity.ok(Map.of(
                "status", "OK",
                "records", records,
                "count", records.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "ERROR",
                "error", e.getMessage(),
                "stackTrace", e.getStackTrace()[0].toString()
            ));
        }
    }
}