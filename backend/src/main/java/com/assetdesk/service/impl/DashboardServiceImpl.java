package com.assetdesk.service.impl;

import com.assetdesk.domain.User;
import com.assetdesk.dto.dashboard.DashboardStatsDTO;
import com.assetdesk.repository.*;
import com.assetdesk.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.HashMap;
import com.assetdesk.domain.Asset;
import com.assetdesk.domain.Issue;
import com.assetdesk.domain.AssetRequest;
import com.assetdesk.exception.UserNotFoundException;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final IssueRepository issueRepository;
    private final AssetAllocationRepository allocationRepository;
    private final AssetRequestRepository requestRepository;
    private final ServiceRecordRepository serviceRecordRepository;
    private final WarrantyHistoryRepository warrantyRepository;

    @Override
    public DashboardStatsDTO getDashboardStats(String userEmail) {
        try {
            System.out.println("Getting dashboard stats for user: " + userEmail);
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));
            
            System.out.println("User found: " + user.getName() + ", Role: " + user.getRole());
            
            return switch (user.getRole()) {
                case EMPLOYEE -> getEmployeeDashboard(user);
                case IT_SUPPORT -> getITSupportDashboard(user);
                case ADMIN -> getAdminDashboard(user);
                default -> throw new IllegalArgumentException("Unknown user role: " + user.getRole());
            };
        } catch (Exception e) {
            System.err.println("Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private DashboardStatsDTO getEmployeeDashboard(User user) {
        return DashboardStatsDTO.builder()
                .myAssets(allocationRepository.countCurrentAllocationsByUserId(user.getId()))
                .myIssues(issueRepository.countByReportedById(user.getId()))
                .pendingRequests(requestRepository.countByRequesterIdAndStatus(user.getId(), AssetRequest.Status.PENDING))
                .assetsByCategory(getMyAssetsByCategory(user.getId()))
                .issuesByStatus(getMyIssuesByStatus(user.getId()))
                .recentActivities(getMyRecentActivities(user.getId()))
                .upcomingWarranties(getMyUpcomingWarranties(user.getId()))
                .topIssues(getMyTopIssues(user.getId()))
                .build();
    }

    private DashboardStatsDTO getITSupportDashboard(User user) {
        return DashboardStatsDTO.builder()
                .totalAssets(assetRepository.count())
                .availableAssets(assetRepository.countByStatus(Asset.Status.AVAILABLE))
                .allocatedAssets(assetRepository.countByStatus(Asset.Status.ALLOCATED))
                .totalIssues(issueRepository.count())
                .openIssues(issueRepository.countByStatusIn(Arrays.asList(Issue.Status.OPEN, Issue.Status.IN_PROGRESS)))
                .pendingRequests(requestRepository.countByStatus(AssetRequest.Status.PENDING))
                .warrantyExpiringCount(getWarrantyExpiringCount())
                .maintenanceDueCount(getMaintenanceDueCount())
                .assetsByCategory(getAssetsByCategory())
                .assetsByStatus(getAssetsByStatus())
                .issuesByPriority(getIssuesByPriority())
                .issuesByStatus(getIssuesByStatus())
                .assetsByDepartment(getAssetsByDepartment())
                .monthlyAssetTrends(getMonthlyAssetTrends())
                .monthlyIssueTrends(getMonthlyIssueTrends())
                .recentActivities(getRecentActivities())
                .upcomingWarranties(getUpcomingWarranties())
                .topIssues(getTopIssues())
                .averageResolutionTime(getAverageResolutionTime())
                .assetUtilizationRate(getAssetUtilizationRate())
                .build();
    }

    private DashboardStatsDTO getAdminDashboard(User user) {
        return DashboardStatsDTO.builder()
                .totalAssets(assetRepository.count())
                .availableAssets(assetRepository.countByStatus(Asset.Status.AVAILABLE))
                .allocatedAssets(assetRepository.countByStatus(Asset.Status.ALLOCATED))
                .totalIssues(issueRepository.count())
                .openIssues(issueRepository.countByStatusIn(Arrays.asList(Issue.Status.OPEN, Issue.Status.IN_PROGRESS)))
                .totalUsers(userRepository.count())
                .pendingRequests(requestRepository.countByStatus(AssetRequest.Status.PENDING))
                .warrantyExpiringCount(getWarrantyExpiringCount())
                .maintenanceDueCount(getMaintenanceDueCount())
                .assetsByCategory(getAssetsByCategory())
                .assetsByStatus(getAssetsByStatus())
                .issuesByPriority(getIssuesByPriority())
                .issuesByStatus(getIssuesByStatus())
                .assetsByDepartment(getAssetsByDepartment())
                .monthlyAssetTrends(getMonthlyAssetTrends())
                .monthlyIssueTrends(getMonthlyIssueTrends())
                .recentActivities(getRecentActivities())
                .upcomingWarranties(getUpcomingWarranties())
                .topIssues(getTopIssues())
                .averageResolutionTime(getAverageResolutionTime())
                .assetUtilizationRate(getAssetUtilizationRate())
                .build();
    }

    private Map<String, Long> getMyAssetsByCategory(Long userId) {
        try {
            return allocationRepository.findCurrentAllocationsByUserId(userId).stream()
                    .map(allocation -> allocation.getAsset())
                    .filter(asset -> asset != null && asset.getCategory() != null)
                    .collect(Collectors.groupingBy(
                            asset -> asset.getCategory().toString(),
                            Collectors.counting()
                    ));
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private Map<String, Long> getMyIssuesByStatus(Long userId) {
        try {
            return issueRepository.findByReportedById(userId).stream()
                    .filter(issue -> issue.getStatus() != null)
                    .collect(Collectors.groupingBy(
                            issue -> issue.getStatus().toString(),
                            Collectors.counting()
                    ));
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private Map<String, Long> getAssetsByCategory() {
        try {
            return assetRepository.findAll().stream()
                    .filter(asset -> asset.getCategory() != null)
                    .collect(Collectors.groupingBy(
                            asset -> asset.getCategory().toString(),
                            Collectors.counting()
                    ));
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private Map<String, Long> getAssetsByStatus() {
        try {
            return assetRepository.findAll().stream()
                    .filter(asset -> asset.getStatus() != null)
                    .collect(Collectors.groupingBy(
                            asset -> asset.getStatus().toString(),
                            Collectors.counting()
                    ));
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private Map<String, Long> getIssuesByPriority() {
        try {
            return issueRepository.findAll().stream()
                    .filter(issue -> issue.getPriority() != null)
                    .collect(Collectors.groupingBy(
                            issue -> issue.getPriority().toString(),
                            Collectors.counting()
                    ));
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private Map<String, Long> getIssuesByStatus() {
        try {
            return issueRepository.findAll().stream()
                    .filter(issue -> issue.getStatus() != null)
                    .collect(Collectors.groupingBy(
                            issue -> issue.getStatus().toString(),
                            Collectors.counting()
                    ));
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private Map<String, Long> getAssetsByDepartment() {
        try {
            return allocationRepository.findCurrentAllocations().stream()
                    .filter(allocation -> allocation.getUser() != null)
                    .collect(Collectors.groupingBy(
                            allocation -> allocation.getUser().getDepartment() != null ? 
                                    allocation.getUser().getDepartment() : "Unassigned",
                            Collectors.counting()
                    ));
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private Map<String, Long> getMonthlyAssetTrends() {
        Map<String, Long> trends = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            String monthKey = monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy"));
            Long count = assetRepository.findAll().stream()
                    .filter(asset -> asset.getPurchaseDate() != null &&
                            !asset.getPurchaseDate().isBefore(monthStart) &&
                            !asset.getPurchaseDate().isAfter(monthEnd))
                    .count();
            trends.put(monthKey, count);
        }
        return trends;
    }

    private Map<String, Long> getMonthlyIssueTrends() {
        Map<String, Long> trends = new LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
            String monthKey = monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy"));
            Long count = issueRepository.findAll().stream()
                    .filter(issue -> issue.getCreatedAt() != null &&
                            !issue.getCreatedAt().isBefore(monthStart) &&
                            !issue.getCreatedAt().isAfter(monthEnd))
                    .count();
            trends.put(monthKey, count);
        }
        return trends;
    }

    private List<DashboardStatsDTO.RecentActivityDTO> getRecentActivities() {
        List<DashboardStatsDTO.RecentActivityDTO> activities = new ArrayList<>();
        
        try {
            // Recent allocations
            allocationRepository.findTop10ByReturnedDateIsNullOrderByAllocatedDateDesc().stream()
                    .limit(5)
                    .filter(allocation -> allocation.getAsset() != null && allocation.getUser() != null)
                    .forEach(allocation -> {
                        activities.add(DashboardStatsDTO.RecentActivityDTO.builder()
                                .type("ALLOCATION")
                                .description("Asset " + (allocation.getAsset().getAssetTag() != null ? allocation.getAsset().getAssetTag() : "Unknown") + " allocated to " + allocation.getUser().getName())
                                .timestamp(allocation.getAllocatedDate() != null ? allocation.getAllocatedDate().toString() : "")
                                .user(allocation.getUser().getName())
                                .status("COMPLETED")
                                .build());
                    });
        } catch (Exception e) {
            // Continue with other activities
        }
        
        try {
            // Recent issues
            issueRepository.findTop5ByOrderByCreatedAtDesc().stream()
                    .filter(issue -> issue.getReportedBy() != null)
                    .forEach(issue -> {
                        activities.add(DashboardStatsDTO.RecentActivityDTO.builder()
                                .type("ISSUE")
                                .description("Issue reported: " + (issue.getTitle() != null ? issue.getTitle() : "Unknown"))
                                .timestamp(issue.getCreatedAt() != null ? issue.getCreatedAt().toString() : "")
                                .user(issue.getReportedBy().getName())
                                .status(issue.getStatus() != null ? issue.getStatus().toString() : "UNKNOWN")
                                .build());
                    });
        } catch (Exception e) {
            // Continue with other activities
        }
        
        try {
            // Recent requests
            requestRepository.findTop5ByOrderByCreatedAtDesc().stream()
                    .filter(request -> request.getRequester() != null)
                    .forEach(request -> {
                        activities.add(DashboardStatsDTO.RecentActivityDTO.builder()
                                .type("REQUEST")
                                .description("Asset request: " + (request.getRequestType() != null ? request.getRequestType().toString() : "Unknown"))
                                .timestamp(request.getCreatedAt() != null ? request.getCreatedAt().toString() : "")
                                .user(request.getRequester().getName())
                                .status(request.getStatus() != null ? request.getStatus().toString() : "UNKNOWN")
                                .build());
                    });
        } catch (Exception e) {
            // Continue
        }
        
        return activities.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<DashboardStatsDTO.RecentActivityDTO> getMyRecentActivities(Long userId) {
        List<DashboardStatsDTO.RecentActivityDTO> activities = new ArrayList<>();
        
        // My recent allocations
        allocationRepository.findTop10ByUserIdAndReturnedDateIsNullOrderByAllocatedDateDesc(userId).stream()
                .limit(3)
                .forEach(allocation -> {
                    activities.add(DashboardStatsDTO.RecentActivityDTO.builder()
                            .type("ALLOCATION")
                            .description("Asset " + allocation.getAsset().getAssetTag() + " allocated to you")
                            .timestamp(allocation.getAllocatedDate().toString())
                            .user(allocation.getUser().getName())
                            .status("ACTIVE")
                            .build());
                });
        
        // My recent issues
        issueRepository.findTop5ByReportedByIdOrderByCreatedAtDesc(userId).forEach(issue -> {
            activities.add(DashboardStatsDTO.RecentActivityDTO.builder()
                    .type("ISSUE")
                    .description("You reported: " + issue.getTitle())
                    .timestamp(issue.getCreatedAt().toString())
                    .user(issue.getReportedBy().getName())
                    .status(issue.getStatus().toString())
                    .build());
        });
        
        // My recent requests
        requestRepository.findTop5ByRequesterIdOrderByCreatedAtDesc(userId).forEach(request -> {
            activities.add(DashboardStatsDTO.RecentActivityDTO.builder()
                    .type("REQUEST")
                    .description("You requested: " + request.getRequestType().toString())
                    .timestamp(request.getCreatedAt().toString())
                    .user(request.getRequester().getName())
                    .status(request.getStatus().toString())
                    .build());
        });
        
        return activities.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<DashboardStatsDTO.UpcomingWarrantyDTO> getUpcomingWarranties() {
        try {
            LocalDate now = LocalDate.now();
            LocalDate thirtyDaysFromNow = now.plusDays(30);
            return warrantyRepository.findWarrantiesExpiringBetween(thirtyDaysFromNow).stream()
                    .filter(warranty -> warranty.getAsset() != null && warranty.getNewExpiryDate() != null)
                    .map(warranty -> DashboardStatsDTO.UpcomingWarrantyDTO.builder()
                            .assetId(warranty.getAsset().getId())
                            .assetName(warranty.getAsset().getName() != null ? warranty.getAsset().getName() : "Unknown")
                            .warrantyEndDate(warranty.getNewExpiryDate().toString())
                            .daysRemaining(java.time.temporal.ChronoUnit.DAYS.between(now, warranty.getNewExpiryDate()))
                            .vendor(warranty.getAsset().getVendor() != null ? warranty.getAsset().getVendor().getName() : "Unknown")
                            .build())
                    .sorted((a, b) -> Long.compare(a.getDaysRemaining(), b.getDaysRemaining()))
                    .limit(10)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private List<DashboardStatsDTO.UpcomingWarrantyDTO> getMyUpcomingWarranties(Long userId) {
        LocalDate now = LocalDate.now();
        LocalDate thirtyDaysFromNow = now.plusDays(30);
        return warrantyRepository.findWarrantiesExpiringBetweenByUserId(thirtyDaysFromNow, userId).stream()
                .map(warranty -> DashboardStatsDTO.UpcomingWarrantyDTO.builder()
                        .assetId(warranty.getAsset().getId())
                        .assetName(warranty.getAsset().getName())
                        .warrantyEndDate(warranty.getNewExpiryDate().toString())
                        .daysRemaining(java.time.temporal.ChronoUnit.DAYS.between(now, warranty.getNewExpiryDate()))
                        .vendor(warranty.getAsset().getVendor() != null ? warranty.getAsset().getVendor().getName() : "Unknown")
                        .build())
                .sorted((a, b) -> Long.compare(a.getDaysRemaining(), b.getDaysRemaining()))
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<DashboardStatsDTO.TopIssueDTO> getTopIssues() {
        try {
            return issueRepository.findTop10OpenIssuesOrderByPriorityDesc().stream()
                    .limit(5)
                    .filter(issue -> issue.getReportedBy() != null)
                    .map(issue -> DashboardStatsDTO.TopIssueDTO.builder()
                            .issueId(issue.getId())
                            .title(issue.getTitle() != null ? issue.getTitle() : "Unknown")
                            .priority(issue.getPriority() != null ? issue.getPriority().toString() : "UNKNOWN")
                            .status(issue.getStatus() != null ? issue.getStatus().toString() : "UNKNOWN")
                            .reportedBy(issue.getReportedBy().getName())
                            .createdAt(issue.getCreatedAt() != null ? issue.getCreatedAt().toString() : "")
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private List<DashboardStatsDTO.TopIssueDTO> getMyTopIssues(Long userId) {
        return issueRepository.findTop10ByReportedByIdAndOpenStatusOrderByPriorityDesc(userId).stream()
                .limit(5)
                .map(issue -> DashboardStatsDTO.TopIssueDTO.builder()
                        .issueId(issue.getId())
                        .title(issue.getTitle())
                        .priority(issue.getPriority().toString())
                        .status(issue.getStatus().toString())
                        .reportedBy(issue.getReportedBy().getName())
                        .createdAt(issue.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());
    }

    private Long getWarrantyExpiringCount() {
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        return warrantyRepository.countWarrantiesExpiringBetween(thirtyDaysFromNow);
    }

    private Long getMaintenanceDueCount() {
        return serviceRecordRepository.countAssetsNeedingMaintenance();
    }

    private Double getAverageResolutionTime() {
        Double avgHours = issueRepository.getAverageResolutionTimeInHours();
        return avgHours != null ? avgHours : 0.0;
    }

    private Double getAssetUtilizationRate() {
        long totalAssets = assetRepository.count();
        long allocatedAssets = assetRepository.countByStatus(Asset.Status.ALLOCATED);
        return totalAssets > 0 ? (double) allocatedAssets / totalAssets * 100 : 0.0;
    }
}