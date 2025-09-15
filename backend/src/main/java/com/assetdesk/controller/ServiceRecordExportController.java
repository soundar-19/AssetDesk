package com.assetdesk.controller;

import com.assetdesk.domain.ServiceRecord;
import com.assetdesk.repository.ServiceRecordRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/service-records/export")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ServiceRecordExportController {

    private final ServiceRecordRepository serviceRecordRepository;

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) BigDecimal costMin,
            @RequestParam(required = false) BigDecimal costMax,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        
        List<ServiceRecord> records = getFilteredServiceRecords(type, dateRange, costMin, costMax, dateFrom, dateTo);
        
        String header = "ID,AssetTag,AssetName,ServiceType,ServiceDate,Description,Cost,VendorName,TechnicianName,Status\\n";
        String body = records.stream().map(r -> String.join(",",
                String.valueOf(r.getId()),
                safe(r.getAsset() != null ? r.getAsset().getAssetTag() : ""),
                safe(r.getAsset() != null ? r.getAsset().getName() : ""),
                safe(r.getServiceType()),
                safe(r.getServiceDate() != null ? r.getServiceDate().toString() : ""),
                safe(r.getServiceDescription()),
                safe(r.getCost() != null ? r.getCost().toString() : ""),
                safe(r.getVendor() != null ? r.getVendor().getName() : ""),
                safe(r.getPerformedBy()),
                safe(r.getStatus())
        )).collect(Collectors.joining("\\n"));
        
        byte[] data = (header + body).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=service-records.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) BigDecimal costMin,
            @RequestParam(required = false) BigDecimal costMax,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) throws Exception {
        
        List<ServiceRecord> records = getFilteredServiceRecords(type, dateRange, costMin, costMax, dateFrom, dateTo);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, baos);
        document.open();

        Font headerFont = new Font(Font.HELVETICA, 16, Font.BOLD);
        Paragraph title = new Paragraph("Service Records Report", headerFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100);
        addHeaderCell(table, "Asset Tag");
        addHeaderCell(table, "Asset Name");
        addHeaderCell(table, "Service Type");
        addHeaderCell(table, "Service Date");
        addHeaderCell(table, "Description");
        addHeaderCell(table, "Cost");
        addHeaderCell(table, "Vendor");
        addHeaderCell(table, "Status");

        for (ServiceRecord r : records) {
            table.addCell(nvl(r.getAsset() != null ? r.getAsset().getAssetTag() : ""));
            table.addCell(nvl(r.getAsset() != null ? r.getAsset().getName() : ""));
            table.addCell(nvl(r.getServiceType()));
            table.addCell(r.getServiceDate() != null ? r.getServiceDate().toString() : "");
            table.addCell(nvl(r.getServiceDescription()));
            table.addCell(r.getCost() != null ? r.getCost().toString() : "");
            table.addCell(nvl(r.getVendor() != null ? r.getVendor().getName() : ""));
            table.addCell(nvl(r.getStatus()));
        }

        document.add(table);
        document.close();

        byte[] pdf = baos.toByteArray();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=service-records.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    private List<ServiceRecord> getFilteredServiceRecords(String type, String dateRange, 
            BigDecimal costMin, BigDecimal costMax, LocalDate dateFrom, LocalDate dateTo) {
        
        List<ServiceRecord> records = serviceRecordRepository.findAll();
        
        // Apply filters
        if (type != null && !type.isEmpty()) {
            records = records.stream()
                    .filter(r -> type.equals(r.getServiceType()))
                    .collect(Collectors.toList());
        }
        
        if (costMin != null) {
            records = records.stream()
                    .filter(r -> r.getCost() != null && r.getCost().compareTo(costMin) >= 0)
                    .collect(Collectors.toList());
        }
        
        if (costMax != null) {
            records = records.stream()
                    .filter(r -> r.getCost() != null && r.getCost().compareTo(costMax) <= 0)
                    .collect(Collectors.toList());
        }
        
        // Date range filtering
        if (dateFrom != null) {
            records = records.stream()
                    .filter(r -> r.getServiceDate() != null && !r.getServiceDate().isBefore(dateFrom))
                    .collect(Collectors.toList());
        }
        
        if (dateTo != null) {
            records = records.stream()
                    .filter(r -> r.getServiceDate() != null && !r.getServiceDate().isAfter(dateTo))
                    .collect(Collectors.toList());
        }
        
        // Quick date range filters
        if (dateRange != null && !dateRange.isEmpty()) {
            LocalDate now = LocalDate.now();
            LocalDate filterDate = switch (dateRange) {
                case "week" -> now.minusWeeks(1);
                case "month" -> now.minusMonths(1);
                case "quarter" -> now.minusMonths(3);
                case "year" -> now.minusYears(1);
                default -> null;
            };
            
            if (filterDate != null) {
                final LocalDate finalFilterDate = filterDate;
                records = records.stream()
                        .filter(r -> r.getServiceDate() != null && !r.getServiceDate().isBefore(finalFilterDate))
                        .collect(Collectors.toList());
            }
        }
        
        return records;
    }

    private static void addHeaderCell(PdfPTable table, String text) {
        Font font = new Font(Font.HELVETICA, 10, Font.BOLD);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(230, 230, 230));
        table.addCell(cell);
    }

    private static String safe(String s) {
        if (s == null) return "";
        String escaped = s.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\\n") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    private static String nvl(String s) { 
        return s == null ? "" : s; 
    }
}