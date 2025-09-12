package com.assetdesk.controller;

import com.assetdesk.domain.WarrantyHistory;
import com.assetdesk.service.WarrantyHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warranty-history")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WarrantyHistoryController {

    private final WarrantyHistoryService service;

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<WarrantyHistory>> list(@PathVariable Long assetId) {
        return ResponseEntity.ok(service.listByAsset(assetId));
    }
}


