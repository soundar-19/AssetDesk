package com.assetdesk.controller;

import com.assetdesk.service.impl.ServiceRecordServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test/service-records")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ServiceRecordTestEndpoint {
    
    private final ServiceRecordServiceImpl serviceRecordService;
    
    @GetMapping("/dto")
    public ResponseEntity<?> testDTOEndpoint(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            var result = serviceRecordService.getAllServiceRecordsDTO(pageable);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Map.of(
                "error", e.getMessage(),
                "status", "error",
                "stackTrace", java.util.Arrays.toString(e.getStackTrace())
            ));
        }
    }
    
    @GetMapping("/dto/{id}")
    public ResponseEntity<?> testDetailEndpoint(@PathVariable Long id) {
        try {
            var result = serviceRecordService.getServiceRecordByIdDTO(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Map.of(
                "error", e.getMessage(),
                "status", "error"
            ));
        }
    }
}