package com.assetdesk.controller;

import com.assetdesk.domain.Asset;
import com.assetdesk.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assets/export")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssetExportController {

    private final AssetRepository assetRepository;

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) BigDecimal costMin,
            @RequestParam(required = false) BigDecimal costMax) {
        
        List<Asset> assets = getFilteredAssets(category, type, status, dateFrom, dateTo, costMin, costMax);
        String header = "ID,AssetTag,Name,Category,Type,Model,SerialNumber,PurchaseDate,WarrantyExpiryDate,Cost,Status\n";
        String body = assets.stream().map(a -> String.join(",",
                String.valueOf(a.getId()),
                safe(a.getAssetTag()),
                safe(a.getName()),
                safe(enumName(a.getCategory())),
                safe(enumName(a.getType())),
                safe(a.getModel()),
                safe(a.getSerialNumber()),
                safe(String.valueOf(a.getPurchaseDate())),
                safe(String.valueOf(a.getWarrantyExpiryDate())),
                safe(String.valueOf(a.getCost())),
                safe(enumName(a.getStatus()))
        )).collect(Collectors.joining("\n"));
        byte[] data = (header + body).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=assets.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    private static String safe(String s) {
        if (s == null) return "";
        String escaped = s.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    private List<Asset> getFilteredAssets(String category, String type, String status, 
            LocalDate dateFrom, LocalDate dateTo, BigDecimal costMin, BigDecimal costMax) {
        
        List<Asset> assets = assetRepository.findAll();
        
        // Apply filters
        if (category != null && !category.isEmpty()) {
            assets = assets.stream()
                    .filter(a -> a.getCategory() != null && category.equals(a.getCategory().name()))
                    .collect(Collectors.toList());
        }
        
        if (type != null && !type.isEmpty()) {
            assets = assets.stream()
                    .filter(a -> a.getType() != null && type.equals(a.getType().name()))
                    .collect(Collectors.toList());
        }
        
        if (status != null && !status.isEmpty()) {
            assets = assets.stream()
                    .filter(a -> a.getStatus() != null && status.equals(a.getStatus().name()))
                    .collect(Collectors.toList());
        }
        
        if (dateFrom != null) {
            assets = assets.stream()
                    .filter(a -> a.getPurchaseDate() != null && !a.getPurchaseDate().isBefore(dateFrom))
                    .collect(Collectors.toList());
        }
        
        if (dateTo != null) {
            assets = assets.stream()
                    .filter(a -> a.getPurchaseDate() != null && !a.getPurchaseDate().isAfter(dateTo))
                    .collect(Collectors.toList());
        }
        
        if (costMin != null) {
            assets = assets.stream()
                    .filter(a -> a.getCost() != null && a.getCost().compareTo(costMin) >= 0)
                    .collect(Collectors.toList());
        }
        
        if (costMax != null) {
            assets = assets.stream()
                    .filter(a -> a.getCost() != null && a.getCost().compareTo(costMax) <= 0)
                    .collect(Collectors.toList());
        }
        
        return assets;
    }

    private static String enumName(Enum<?> e) {
        return e != null ? e.name() : null;
    }
}


