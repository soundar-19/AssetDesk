package com.assetdesk.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    
    // Common stats
    private Long totalAssets;
    private Long totalIssues;
    
    // Role-specific stats
    private Long myAssets;
    private Long myIssues;
    private Long myRequests;
    private Long availableAssets;
    private Long allocatedAssets;
    private Long openIssues;
    private Long totalUsers;
    private Long pendingRequests;
    
    // Charts data
    private Map<String, Long> assetsByCategory;
    private Map<String, Long> assetsByStatus;
    private Map<String, Long> issuesByPriority;
    private Map<String, Long> issuesByStatus;
    private Map<String, Long> assetsByDepartment;
    private Map<String, Long> monthlyAssetTrends;
    private Map<String, Long> monthlyIssueTrends;
    
    // Recent activities
    private List<RecentActivityDTO> recentActivities;
    private List<UpcomingWarrantyDTO> upcomingWarranties;
    private List<TopIssueDTO> topIssues;
    
    // Performance metrics
    private Double averageResolutionTime;
    private Double assetUtilizationRate;
    private Long warrantyExpiringCount;
    private Long maintenanceDueCount;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityDTO {
        private String type;
        private String description;
        private String timestamp;
        private String user;
        private String status;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingWarrantyDTO {
        private Long assetId;
        private String assetName;
        private String warrantyEndDate;
        private Long daysRemaining;
        private String vendor;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopIssueDTO {
        private Long issueId;
        private String title;
        private String priority;
        private String status;
        private String reportedBy;
        private String createdAt;
    }
}