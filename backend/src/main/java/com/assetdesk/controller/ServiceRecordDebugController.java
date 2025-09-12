package com.assetdesk.controller;

import com.assetdesk.repository.ServiceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug/service-records")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ServiceRecordDebugController {
    
    private final ServiceRecordRepository serviceRecordRepository;
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getCount() {
        try {
            long count = serviceRecordRepository.count();
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.ok(response);
        }
    }
    
    @GetMapping("/simple")
    public ResponseEntity<Map<String, Object>> getSimple() {
        try {
            var records = serviceRecordRepository.findAll().stream()
                .limit(3)
                .map(record -> {
                    Map<String, Object> recordMap = new HashMap<>();
                    recordMap.put("id", record.getId());
                    recordMap.put("serviceDate", record.getServiceDate());
                    recordMap.put("serviceType", record.getServiceType());
                    recordMap.put("description", record.getServiceDescription());
                    recordMap.put("cost", record.getCost());
                    return recordMap;
                })
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("records", records);
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.ok(response);
        }
    }
}