package com.assetdesk.service;

import com.assetdesk.dto.dashboard.DashboardStatsDTO;

public interface DashboardService {
    DashboardStatsDTO getDashboardStats(String userEmail);
}