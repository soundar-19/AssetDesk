package com.assetdesk.controller;

import com.assetdesk.domain.CommonIssue;
import com.assetdesk.repository.CommonIssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/common-issues")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommonIssueController {

    private final CommonIssueRepository repository;

    @GetMapping
    public ResponseEntity<Page<CommonIssue>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CommonIssue> data;
        if (category != null && !category.isBlank()) {
            data = repository.findByCategoryContainingIgnoreCase(category, pageable);
        } else if (q != null && !q.isBlank()) {
            data = repository.findByTitleContainingIgnoreCase(q, pageable);
        } else {
            data = repository.findAll(pageable);
        }
        return ResponseEntity.ok(data);
    }

    @PostMapping
    public ResponseEntity<CommonIssue> create(@RequestBody CommonIssue issue) {
        return new ResponseEntity<>(repository.save(issue), HttpStatus.CREATED);
    }
}


