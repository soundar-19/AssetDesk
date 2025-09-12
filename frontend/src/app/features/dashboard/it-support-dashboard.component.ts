import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardStats } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-it-support-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="it-support-dashboard">
      <!-- Key Metrics -->
      <section class="metrics-grid" aria-label="IT Support Metrics">
        <div class="metric-card primary">
          <div class="metric-icon">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2H3zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ dashboardStats.totalAssets || 0 }}</div>
            <div class="metric-label">Total Assets</div>
            <div class="metric-trend">
              <span class="trend-indicator positive">↗</span>
              <span class="trend-text">{{ getAssetTrend() }}</span>
            </div>
          </div>
        </div>

        <div class="metric-card success">
          <div class="metric-icon">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ dashboardStats.availableAssets || 0 }}</div>
            <div class="metric-label">Available Assets</div>
            <div class="metric-trend">
              <span class="utilization-rate">{{ getUtilizationRate() }}% utilized</span>
            </div>
          </div>
        </div>

        <div class="metric-card warning">
          <div class="metric-icon">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ dashboardStats.openIssues || 0 }}</div>
            <div class="metric-label">Open Issues</div>
            <div class="metric-trend">
              <span class="avg-resolution">{{ dashboardStats.averageResolutionTime || 0 }}h avg resolution</span>
            </div>
          </div>
        </div>

        <div class="metric-card danger">
          <div class="metric-icon">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ dashboardStats.warrantyExpiringCount || 0 }}</div>
            <div class="metric-label">Warranty Alerts</div>
            <div class="metric-trend">
              <span class="maintenance-due">{{ dashboardStats.maintenanceDueCount || 0 }} maintenance due</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Asset Distribution Chart -->
        <section class="card chart-card">
          <header class="card-header">
            <h2 class="card-title">Asset Distribution</h2>
            <div class="chart-controls">
              <button class="btn-tab active" (click)="setChartView('category')">By Category</button>
              <button class="btn-tab" (click)="setChartView('status')">By Status</button>
              <button class="btn-tab" (click)="setChartView('department')">By Department</button>
            </div>
          </header>
          <div class="card-body">
            <div class="chart-container">
              <div *ngIf="chartView === 'category'" class="donut-chart">
                <div class="chart-legend">
                  <div *ngFor="let item of getAssetsByCategoryArray()" class="legend-item">
                    <span class="legend-color" [style.background-color]="getCategoryColor(item.key)"></span>
                    <span class="legend-label">{{ item.key }}</span>
                    <span class="legend-value">{{ item.value }}</span>
                    <span class="legend-percentage">{{ getPercentage(item.value, getTotalAssets()) }}%</span>
                  </div>
                </div>
              </div>
              <div *ngIf="chartView === 'status'" class="bar-chart">
                <div class="chart-bars">
                  <div *ngFor="let item of getAssetsByStatusArray()" class="bar-item">
                    <div class="bar-label">{{ formatStatus(item.key) }}</div>
                    <div class="bar-container">
                      <div class="bar-fill" 
                           [style.width.%]="getPercentage(item.value, getTotalAssets())"
                           [style.background-color]="getStatusColor(item.key)">
                      </div>
                    </div>
                    <div class="bar-value">{{ item.value }}</div>
                  </div>
                </div>
              </div>
              <div *ngIf="chartView === 'department'" class="department-chart">
                <div class="chart-legend">
                  <div *ngFor="let item of getAssetsByDepartmentArray()" class="legend-item">
                    <span class="legend-color" [style.background-color]="getDepartmentColor(item.key)"></span>
                    <span class="legend-label">{{ item.key }}</span>
                    <span class="legend-value">{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Issue Analytics -->
        <section class="card analytics-card">
          <header class="card-header">
            <h2 class="card-title">Issue Analytics</h2>
          </header>
          <div class="card-body">
            <div class="analytics-grid">
              <div class="analytic-item">
                <h4>By Priority</h4>
                <div class="priority-bars">
                  <div *ngFor="let item of getIssuesByPriorityArray()" class="priority-bar">
                    <span class="priority-label">{{ item.key }}</span>
                    <div class="priority-container">
                      <div class="priority-fill" 
                           [style.width.%]="getPercentage(item.value, getTotalIssues())"
                           [class]="'priority-' + item.key.toLowerCase()">
                      </div>
                    </div>
                    <span class="priority-count">{{ item.value }}</span>
                  </div>
                </div>
              </div>
              <div class="analytic-item">
                <h4>By Status</h4>
                <div class="status-circles">
                  <div *ngFor="let item of getIssuesByStatusArray()" class="status-circle">
                    <div class="circle-indicator" [class]="'status-' + item.key.toLowerCase()">
                      <span class="circle-count">{{ item.value }}</span>
                    </div>
                    <span class="circle-label">{{ formatStatus(item.key) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Monthly Trends -->
        <section class="card trends-card">
          <header class="card-header">
            <h2 class="card-title">Monthly Trends</h2>
            <div class="trend-controls">
              <button class="btn-tab" [class.active]="trendView === 'assets'" (click)="setTrendView('assets')">Assets</button>
              <button class="btn-tab" [class.active]="trendView === 'issues'" (click)="setTrendView('issues')">Issues</button>
            </div>
          </header>
          <div class="card-body">
            <div class="trend-chart">
              <div *ngIf="trendView === 'assets'" class="line-chart">
                <div class="chart-lines">
                  <div *ngFor="let item of getMonthlyAssetTrendsArray(); let i = index" class="chart-point">
                    <div class="point-label">{{ item.key }}</div>
                    <div class="point-bar" [style.height.px]="getBarHeight(item.value, getMaxTrendValue('assets'))"></div>
                    <div class="point-value">{{ item.value }}</div>
                  </div>
                </div>
              </div>
              <div *ngIf="trendView === 'issues'" class="line-chart">
                <div class="chart-lines">
                  <div *ngFor="let item of getMonthlyIssueTrendsArray(); let i = index" class="chart-point">
                    <div class="point-label">{{ item.key }}</div>
                    <div class="point-bar" [style.height.px]="getBarHeight(item.value, getMaxTrendValue('issues'))"></div>
                    <div class="point-value">{{ item.value }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Activities -->
        <section class="card activities-card">
          <header class="card-header">
            <h2 class="card-title">Recent Activities</h2>
            <a routerLink="/activities" class="view-all-link">View All</a>
          </header>
          <div class="card-body">
            <div class="activities-timeline">
              <div *ngFor="let activity of dashboardStats.recentActivities?.slice(0, 8)" class="timeline-item">
                <div class="timeline-marker" [class]="'marker-' + activity.type.toLowerCase()"></div>
                <div class="timeline-content">
                  <p class="timeline-description">{{ activity.description }}</p>
                  <div class="timeline-meta">
                    <span class="timeline-user">{{ activity.user }}</span>
                    <span class="timeline-time">{{ formatTime(activity.timestamp) }}</span>
                  </div>
                </div>
                <div class="timeline-status" [class]="'status-' + activity.status.toLowerCase()">
                  {{ formatStatus(activity.status) }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Top Issues -->
        <section class="card issues-card">
          <header class="card-header">
            <h2 class="card-title">Priority Issues</h2>
            <a routerLink="/issues" class="view-all-link">View All</a>
          </header>
          <div class="card-body">
            <div class="issues-list">
              <div *ngFor="let issue of dashboardStats.topIssues" class="issue-row">
                <div class="issue-priority" [class]="'priority-' + issue.priority.toLowerCase()"></div>
                <div class="issue-info">
                  <h4 class="issue-title">{{ issue.title }}</h4>
                  <div class="issue-meta">
                    <span class="issue-reporter">{{ issue.reportedBy }}</span>
                    <span class="issue-date">{{ formatDate(issue.createdAt) }}</span>
                  </div>
                </div>
                <div class="issue-actions">
                  <button class="btn-action" [routerLink]="['/issues', issue.issueId]">View</button>
                  <button class="btn-action primary">Assign</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Warranty Alerts -->
        <section class="card warranty-card" *ngIf="dashboardStats.upcomingWarranties && dashboardStats.upcomingWarranties.length > 0">
          <header class="card-header">
            <h2 class="card-title">Warranty Alerts</h2>
            <a routerLink="/assets/warranty" class="view-all-link">View All</a>
          </header>
          <div class="card-body">
            <div class="warranty-alerts">
              <div *ngFor="let warranty of dashboardStats.upcomingWarranties" class="warranty-alert">
                <div class="alert-severity" [class]="getWarrantyAlertClass(warranty.daysRemaining)">
                  <span class="days-count">{{ warranty.daysRemaining }}</span>
                  <span class="days-label">days</span>
                </div>
                <div class="alert-info">
                  <h4 class="alert-asset">{{ warranty.assetName }}</h4>
                  <p class="alert-vendor">{{ warranty.vendor }}</p>
                  <span class="alert-date">Expires: {{ formatDate(warranty.warrantyEndDate) }}</span>
                </div>
                <div class="alert-actions">
                  <button class="btn-action" [routerLink]="['/assets', warranty.assetId]">View Asset</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="card actions-card">
          <header class="card-header">
            <h2 class="card-title">Quick Actions</h2>
          </header>
          <div class="card-body">
            <div class="actions-grid">
              <a routerLink="/assets/add" class="action-item primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                </svg>
                Add Asset
              </a>
              <a routerLink="/assets/allocate" class="action-item success">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                Allocate Asset
              </a>
              <a routerLink="/issues/unassigned" class="action-item warning">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
                </svg>
                Assign Issues
              </a>
              <a routerLink="/service-records" class="action-item info">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
                </svg>
                Maintenance
              </a>
              <a routerLink="/vendors" class="action-item secondary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                </svg>
                Manage Vendors
              </a>
              <a routerLink="/reports" class="action-item dark">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
                Reports
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .it-support-dashboard {
      padding: 1rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      transition: transform 0.2s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
    }

    .metric-card.primary { border-left: 4px solid #3b82f6; }
    .metric-card.success { border-left: 4px solid #10b981; }
    .metric-card.warning { border-left: 4px solid #f59e0b; }
    .metric-card.danger { border-left: 4px solid #ef4444; }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .metric-card.primary .metric-icon { background: #3b82f6; }
    .metric-card.success .metric-icon { background: #10b981; }
    .metric-card.warning .metric-icon { background: #f59e0b; }
    .metric-card.danger .metric-icon { background: #ef4444; }

    .metric-content {
      flex: 1;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .metric-label {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .metric-trend {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
    }

    .trend-indicator {
      font-weight: 600;
    }

    .trend-indicator.positive { color: #10b981; }
    .trend-indicator.negative { color: #ef4444; }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .card-header {
      padding: 1.5rem 1.5rem 0;
      display: flex;
      justify-content: between;
      align-items: center;
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
      flex: 1;
    }

    .card-body {
      padding: 1.5rem;
    }

    .chart-controls, .trend-controls {
      display: flex;
      gap: 0.5rem;
    }

    .btn-tab {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-tab:hover {
      background: #f9fafb;
    }

    .btn-tab.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .chart-container {
      margin-top: 1rem;
    }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-label {
      flex: 1;
      font-size: 0.875rem;
      color: #4b5563;
    }

    .legend-value {
      font-weight: 600;
      color: #1f2937;
      margin-right: 0.5rem;
    }

    .legend-percentage {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .bar-chart {
      margin-top: 1rem;
    }

    .chart-bars {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .bar-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .bar-label {
      width: 80px;
      font-size: 0.875rem;
      color: #4b5563;
    }

    .bar-container {
      flex: 1;
      height: 20px;
      background: #f3f4f6;
      border-radius: 10px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .bar-value {
      width: 40px;
      text-align: right;
      font-weight: 600;
      color: #1f2937;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .analytic-item h4 {
      margin: 0 0 1rem;
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .priority-bars {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .priority-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .priority-label {
      width: 60px;
      font-size: 0.75rem;
      color: #4b5563;
    }

    .priority-container {
      flex: 1;
      height: 16px;
      background: #f3f4f6;
      border-radius: 8px;
      overflow: hidden;
    }

    .priority-fill {
      height: 100%;
      border-radius: 8px;
      transition: width 0.3s ease;
    }

    .priority-fill.priority-high { background: #ef4444; }
    .priority-fill.priority-medium { background: #f59e0b; }
    .priority-fill.priority-low { background: #10b981; }

    .priority-count {
      width: 30px;
      text-align: right;
      font-size: 0.75rem;
      font-weight: 600;
      color: #1f2937;
    }

    .status-circles {
      display: flex;
      justify-content: space-around;
      gap: 1rem;
    }

    .status-circle {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .circle-indicator {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .circle-indicator.status-open { background: #ef4444; }
    .circle-indicator.status-in_progress { background: #f59e0b; }
    .circle-indicator.status-resolved { background: #10b981; }
    .circle-indicator.status-closed { background: #6b7280; }

    .circle-label {
      font-size: 0.75rem;
      color: #6b7280;
      text-align: center;
    }

    .line-chart {
      margin-top: 1rem;
    }

    .chart-lines {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 1rem;
      height: 120px;
      padding: 1rem 0;
    }

    .chart-point {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .point-label {
      font-size: 0.75rem;
      color: #6b7280;
      writing-mode: vertical-rl;
      text-orientation: mixed;
    }

    .point-bar {
      width: 20px;
      background: #3b82f6;
      border-radius: 2px 2px 0 0;
      min-height: 4px;
    }

    .point-value {
      font-size: 0.75rem;
      font-weight: 600;
      color: #1f2937;
    }

    .activities-timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .timeline-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .timeline-marker {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .timeline-marker.marker-allocation { background: #3b82f6; }
    .timeline-marker.marker-issue { background: #f59e0b; }
    .timeline-marker.marker-maintenance { background: #10b981; }

    .timeline-content {
      flex: 1;
    }

    .timeline-description {
      margin: 0 0 0.25rem;
      font-size: 0.875rem;
      color: #1f2937;
    }

    .timeline-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .timeline-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .timeline-status.status-completed { background: #dcfce7; color: #166534; }
    .timeline-status.status-open { background: #fef2f2; color: #991b1b; }
    .timeline-status.status-in_progress { background: #fef3c7; color: #92400e; }

    .issues-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .issue-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .issue-priority {
      width: 4px;
      height: 40px;
      border-radius: 2px;
    }

    .issue-priority.priority-high { background: #ef4444; }
    .issue-priority.priority-medium { background: #f59e0b; }
    .issue-priority.priority-low { background: #10b981; }

    .issue-info {
      flex: 1;
    }

    .issue-title {
      margin: 0 0 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1f2937;
    }

    .issue-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .issue-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      text-decoration: none;
      color: #374151;
      transition: all 0.2s ease;
    }

    .btn-action:hover {
      background: #f9fafb;
    }

    .btn-action.primary {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .warranty-alerts {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .warranty-alert {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .alert-severity {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem;
      border-radius: 8px;
      min-width: 60px;
    }

    .alert-severity.critical { background: #fef2f2; color: #991b1b; }
    .alert-severity.warning { background: #fef3c7; color: #92400e; }
    .alert-severity.normal { background: #dcfce7; color: #166534; }

    .days-count {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .days-label {
      font-size: 0.75rem;
    }

    .alert-info {
      flex: 1;
    }

    .alert-asset {
      margin: 0 0 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1f2937;
    }

    .alert-vendor {
      margin: 0 0 0.25rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .alert-date {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      transition: transform 0.2s ease;
    }

    .action-item:hover {
      transform: translateY(-2px);
    }

    .action-item.primary { background: #3b82f6; }
    .action-item.success { background: #10b981; }
    .action-item.warning { background: #f59e0b; }
    .action-item.info { background: #06b6d4; }
    .action-item.secondary { background: #6b7280; }
    .action-item.dark { background: #374151; }

    .view-all-link {
      color: #3b82f6;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
    }
  `]
})
export class ITSupportDashboardComponent {
  @Input() dashboardStats: DashboardStats = {};
  
  chartView: 'category' | 'status' | 'department' = 'category';
  trendView: 'assets' | 'issues' = 'assets';

  setChartView(view: 'category' | 'status' | 'department') {
    this.chartView = view;
  }

  setTrendView(view: 'assets' | 'issues') {
    this.trendView = view;
  }

  getUtilizationRate(): number {
    return Math.round(this.dashboardStats.assetUtilizationRate || 0);
  }

  getTotalAssets(): number {
    return this.dashboardStats.totalAssets || 0;
  }

  getTotalIssues(): number {
    return this.dashboardStats.totalIssues || 0;
  }

  getAssetsByCategoryArray() {
    if (!this.dashboardStats.assetsByCategory) return [];
    return Object.entries(this.dashboardStats.assetsByCategory).map(([key, value]) => ({ key, value }));
  }

  getAssetsByStatusArray() {
    if (!this.dashboardStats.assetsByStatus) return [];
    return Object.entries(this.dashboardStats.assetsByStatus).map(([key, value]) => ({ key, value }));
  }

  getAssetsByDepartmentArray() {
    if (!this.dashboardStats.assetsByDepartment) return [];
    return Object.entries(this.dashboardStats.assetsByDepartment).map(([key, value]) => ({ key, value }));
  }

  getIssuesByPriorityArray() {
    if (!this.dashboardStats.issuesByPriority) return [];
    return Object.entries(this.dashboardStats.issuesByPriority).map(([key, value]) => ({ key, value }));
  }

  getIssuesByStatusArray() {
    if (!this.dashboardStats.issuesByStatus) return [];
    return Object.entries(this.dashboardStats.issuesByStatus).map(([key, value]) => ({ key, value }));
  }

  getMonthlyAssetTrendsArray() {
    if (!this.dashboardStats.monthlyAssetTrends) return [];
    return Object.entries(this.dashboardStats.monthlyAssetTrends).map(([key, value]) => ({ key, value }));
  }

  getMonthlyIssueTrendsArray() {
    if (!this.dashboardStats.monthlyIssueTrends) return [];
    return Object.entries(this.dashboardStats.monthlyIssueTrends).map(([key, value]) => ({ key, value }));
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'HARDWARE': '#3b82f6',
      'SOFTWARE': '#10b981',
      'FURNITURE': '#f59e0b',
      'VEHICLE': '#ef4444',
      'OTHER': '#6b7280'
    };
    return colors[category] || '#6b7280';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'AVAILABLE': '#10b981',
      'ALLOCATED': '#3b82f6',
      'MAINTENANCE': '#f59e0b',
      'RETIRED': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  getDepartmentColor(department: string): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
    const index = department.charCodeAt(0) % colors.length;
    return colors[index];
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  getMaxTrendValue(type: 'assets' | 'issues'): number {
    const data = type === 'assets' ? this.dashboardStats.monthlyAssetTrends : this.dashboardStats.monthlyIssueTrends;
    if (!data) return 1;
    return Math.max(...Object.values(data));
  }

  getBarHeight(value: number, maxValue: number): number {
    return maxValue > 0 ? (value / maxValue) * 80 : 4;
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getWarrantyAlertClass(daysRemaining: number): string {
    if (daysRemaining <= 7) return 'critical';
    if (daysRemaining <= 30) return 'warning';
    return 'normal';
  }

  getAssetTrend(): string {
    // Calculate trend based on monthly asset data if available
    if (this.dashboardStats.monthlyAssetTrends) {
      const values = Object.values(this.dashboardStats.monthlyAssetTrends);
      if (values.length >= 2) {
        const current = values[values.length - 1];
        const previous = values[values.length - 2];
        const change = previous > 0 ? ((current - previous) / previous * 100) : 0;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% this month`;
      }
    }
    return 'No trend data';
  }
}