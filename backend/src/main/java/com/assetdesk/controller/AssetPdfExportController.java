package com.assetdesk.controller;

import com.assetdesk.domain.Asset;
import com.assetdesk.repository.AssetRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.List;

@RestController
@RequestMapping("/api/assets/export")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssetPdfExportController {

    private final AssetRepository assetRepository;

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf() throws Exception {
        List<Asset> assets = assetRepository.findAll();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, baos);
        document.open();

        Font headerFont = new Font(Font.HELVETICA, 16, Font.BOLD);
        Paragraph title = new Paragraph("Assets Report", headerFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        addHeaderCell(table, "Asset Tag");
        addHeaderCell(table, "Name");
        addHeaderCell(table, "Category");
        addHeaderCell(table, "Type");
        addHeaderCell(table, "Purchase Date");
        addHeaderCell(table, "Cost");
        addHeaderCell(table, "Status");

        for (Asset a : assets) {
            table.addCell(nvl(a.getAssetTag()));
            table.addCell(nvl(a.getName()));
            table.addCell(a.getCategory() != null ? a.getCategory().name() : "");
            table.addCell(a.getType() != null ? a.getType().name() : "");
            table.addCell(a.getPurchaseDate() != null ? a.getPurchaseDate().toString() : "");
            table.addCell(a.getCost() != null ? a.getCost().toString() : "");
            table.addCell(a.getStatus() != null ? a.getStatus().name() : "");
        }

        document.add(table);
        document.close();

        byte[] pdf = baos.toByteArray();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=assets.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    private static void addHeaderCell(PdfPTable table, String text) {
        Font font = new Font(Font.HELVETICA, 10, Font.BOLD);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(230, 230, 230));
        table.addCell(cell);
    }

    private static String nvl(String s) { return s == null ? "" : s; }
}


