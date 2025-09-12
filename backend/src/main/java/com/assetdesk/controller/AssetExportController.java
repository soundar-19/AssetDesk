package com.assetdesk.controller;

import com.assetdesk.domain.Asset;
import com.assetdesk.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assets/export")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssetExportController {

    private final AssetRepository assetRepository;

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsv() {
        List<Asset> assets = assetRepository.findAll();
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

    private static String enumName(Enum<?> e) {
        return e != null ? e.name() : null;
    }
}


