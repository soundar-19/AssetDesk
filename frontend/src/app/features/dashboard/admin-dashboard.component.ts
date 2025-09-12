import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardStats } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <!-- Executive Summary -->
      <section class="executive-summary">
        <div class="summary-header">
          <h2>Executive Summary</h2>
          <div class="summary-period">
            <select class="period-selector">
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
        <div class="summary-grid">
          <div class="summary-card primary">
            <div class="summary-icon">
              <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
              </svg>
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ dashboardStats.totalAssets || 0 }}</div>
              <div class="summary-label">Total Assets</div>
              <div class="summary-change positive">{{ getAssetTrend() }}</div>
            </div>
          </div>

          <div class="summary-card success">
            <div class="summary-icon">
              <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ dashboardStats.totalUsers || 0 }}</div>
              <div class="summary-label">Active Users</div>
              <div class="summary-change positive">{{ getUserTrend() }}</div>
            </div>
          </div>

          <div class="summary-card warning">
            <div class="summary-icon">
              <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
              </svg>
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ dashboardStats.openIssues || 0 }}</div>
              <div class="summary-label">Open Issues</div>
              <div class="summary-change" [class]="getIssueTrendClass()">{{ getIssueTrend() }}</div>
            </div>
          </div>

          <div class="summary-card info">
            <div class="summary-icon">
              <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
              </svg>
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ getUtilizationRate() }}%</div>
              <div class="summary-label">Asset Utilization</div>
              <div class="summary-change positive">{{ getUtilizationTrend() }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Dashboard Grid -->
      <div class="admin-grid">
        <!-- System Overview -->
        <section class="card overview-card">
          <header class="card-header">
            <h3 class="card-title">System Overview</h3>
            <div class="overview-controls">
              <button class="btn-control" [class.active]="overviewView === 'assets'" (click)="setOverviewView('assets')">Assets</button>
              <button class="btn-control" [class.active]="overviewView === 'users'" (click)="setOverviewView('users')">Users</button>
              <button class="btn-control" [class.active]="overviewView === 'issues'" (click)="setOverviewView('issues')">Issues</button>
            </div>
          </header>
          <div class="card-body">
            <div *ngIf="overviewView === 'assets'" class="overview-content">
              <div class="overview-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ dashboardStats.totalAssets || 0 }}</span>
                  <span class="stat-label">Total Assets</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ dashboardStats.availableAssets || 0 }}</span>
                  <span class="stat-label">Available</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ dashboardStats.allocatedAssets || 0 }}</span>
                  <span class="stat-label">Allocated</span>
                </div>
              </div>
              <div class="overview-chart">
                <div class="donut-chart-container">
                  <div class="chart-legend">
                    <div *ngFor="let item of getAssetsByStatusArray()" class="legend-row">
                      <span class="legend-dot" [style.background-color]="getStatusColor(item.key)"></span>
                      <span class="legend-text">{{ formatStatus(item.key) }}</span>
                      <span class="legend-count">{{ item.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div *ngIf="overviewView === 'users'" class="overview-content">
              <div class="overview-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ dashboardStats.totalUsers || 0 }}</span>
                  <span class="stat-label">Total Users</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ getActiveUsersCount() }}</span>
                  <span class="stat-label">Active</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ getNewUsersCount() }}</span>
                  <span class="stat-label">New This Month</span>
                </div>
              </div>
            </div>
            
            <div *ngIf="overviewView === 'issues'" class="overview-content">
              <div class="overview-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ dashboardStats.totalIssues || 0 }}</span>
                  <span class="stat-label">Total Issues</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ dashboardStats.openIssues || 0 }}</span>
                  <span class="stat-label">Open</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ dashboardStats.averageResolutionTime || 0 }}h</span>
                  <span class="stat-label">Avg Resolution</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Performance Metrics -->
        <section class="card metrics-card">
          <header class="card-header">
            <h3 class="card-title">Performance Metrics</h3>
          </header>
          <div class="card-body">
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-header">
                  <span class="metric-title">Asset Utilization</span>
                  <span class="metric-value">{{ getUtilizationRate() }}%</span>
                </div>
                <div class="metric-bar">
                  <div class="bar-fill" [style.width.%]="getUtilizationRate()"></div>
                </div>
                <div class="metric-target">Target: 85%</div>
              </div>
              
              <div class="metric-item">
                <div class="metric-header">
                  <span class="metric-title">Issue Resolution Rate</span>
                  <span class="metric-value">{{ getResolutionRate() }}%</span>
                </div>
                <div class="metric-bar">
                  <div class="bar-fill success" [style.width.%]="getResolutionRate()"></div>
                </div>
                <div class="metric-target">Target: 90%</div>
              </div>
              
              <div class="metric-item">
                <div class="metric-header">
                  <span class="metric-title">User Satisfaction</span>
                  <span class="metric-value">{{ getUserSatisfaction() }}%</span>
                </div>
                <div class="metric-bar">
                  <div class="bar-fill warning" [style.width.%]="getUserSatisfaction()"></div>
                </div>
                <div class="metric-target">Target: 95%</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Department Analytics -->
        <section class="card department-card">
          <header class="card-header">
            <h3 class="card-title">Department Analytics</h3>
          </header>
          <div class="card-body">
            <div class="department-grid">
              <div *ngFor="let dept of getDepartmentAnalytics()" class="department-item">
                <div class="dept-header">
                  <h4 class="dept-name">{{ dept.name }}</h4>
                  <span class="dept-count">{{ dept.assetCount }} assets</span>
                </div>
                <div class="dept-metrics">
                  <div class="dept-metric">
                    <span class="metric-label">Users</span>
                    <span class="metric-value">{{ dept.userCount }}</span>
                  </div>
                  <div class="dept-metric">
                    <span class="metric-label">Issues</span>
                    <span class="metric-value">{{ dept.issueCount }}</span>
                  </div>
                  <div class="dept-metric">
                    <span class="metric-label">Utilization</span>
                    <span class="metric-value">{{ dept.utilization }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Financial Overview -->
        <section class="card financial-card">
          <header class="card-header">
            <h3 class="card-title">Financial Overview</h3>
            <div class="financial-period">
              <select class="period-selector">
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </header>
          <div class="card-body">
            <div class="financial-summary">
              <div class="financial-item">
                <div class="financial-icon primary">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"/>
                  </svg>
                </div>
                <div class="financial-content">
                  <div class="financial-value">{{ getTotalAssetValue() }}</div>
                  <div class="financial-label">Total Asset Value</div>
                  <div class="financial-change positive">{{ getAssetValueTrend() }}</div>
                </div>
              </div>
              
              <div class="financial-item">
                <div class="financial-icon warning">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
                  </svg>
                </div>
                <div class="financial-content">
                  <div class="financial-value">{{ getMaintenanceCost() }}</div>
                  <div class="financial-label">Monthly Maintenance</div>
                  <div class="financial-change negative">{{ getMaintenanceTrend() }}</div>
                </div>
              </div>
              
              <div class="financial-item">
                <div class="financial-icon success">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                  </svg>
                </div>
                <div class="financial-content">
                  <div class="financial-value">{{ getCostSavings() }}</div>
                  <div class="financial-label">Cost Savings</div>
                  <div class="financial-change positive">{{ getSavingsTrend() }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- System Health -->
        <section class="card health-card">
          <header class="card-header">
            <h3 class="card-title">System Health</h3>
          </header>
          <div class="card-body">
            <div class="health-indicators">
              <div class="health-item">
                <div class="health-status healthy">
                  <div class="status-dot"></div>
                  <span class="status-text">Healthy</span>
                </div>
                <div class="health-metric">
                  <span class="metric-label">Database</span>
                  <span class="metric-value">99.9% uptime</span>
                </div>
              </div>
              
              <div class="health-item">
                <div class="health-status warning">
                  <div class="status-dot"></div>
                  <span class="status-text">Warning</span>
                </div>
                <div class="health-metric">
                  <span class="metric-label">Storage</span>
                  <span class="metric-value">78% used</span>
                </div>
              </div>
              
              <div class="health-item">
                <div class="health-status healthy">
                  <div class="status-dot"></div>
                  <span class="status-text">Healthy</span>
                </div>
                <div class="health-metric">
                  <span class="metric-label">API Response</span>
                  <span class="metric-value">145ms avg</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Activities -->
        <section class="card activities-card">
          <header class="card-header">
            <h3 class="card-title">Recent System Activities</h3>
            <a routerLink="/audit-logs" class="view-all-link">View Audit Logs</a>
          </header>
          <div class="card-body">
            <div class="activities-list">
              <div *ngFor="let activity of dashboardStats.recentActivities?.slice(0, 6)" class="activity-row">
                <div class="activity-icon" [class]="'icon-' + activity.type.toLowerCase()">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path *ngIf="activity.type === 'ALLOCATION'" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    <path *ngIf="activity.type === 'ISSUE'" fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
                    <path *ngIf="activity.type === 'USER'" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                </div>
                <div class="activity-content">
                  <p class="activity-description">{{ activity.description }}</p>
                  <div class="activity-meta">
                    <span class="activity-user">{{ activity.user }}</span>
                    <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                  </div>
                </div>
                <div class="activity-status" [class]="'status-' + activity.status.toLowerCase()">
                  {{ formatStatus(activity.status) }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Admin Actions -->
        <section class="card admin-actions-card">
          <header class="card-header">
            <h3 class="card-title">Admin Actions</h3>
          </header>
          <div class="card-body">
            <div class="admin-actions-grid">
              <a routerLink="/users/add" class="admin-action primary">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
                </svg>
                <span>Add User</span>
              </a>
              
              <a routerLink="/assets/bulk-import" class="admin-action success">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
                </svg>
                <span>Bulk Import</span>
              </a>
              
              <a routerLink="/reports/generate" class="admin-action info">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
                <span>Generate Report</span>
              </a>
              
              <a routerLink="/system/settings" class="admin-action warning">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
                </svg>
                <span>System Settings</span>
              </a>
              
              <a routerLink="/backup/create" class="admin-action secondary">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
                </svg>
                <span>Backup Data</span>
              </a>
              
              <a routerLink="/notifications/broadcast" class="admin-action danger">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v6.114a4 4 0 10.2 7.684 1 1 0 00.8-.2V13a1 1 0 001-1V6.28l8-1.6v4.434a4 4 0 10.2 7.684 1 1 0 00.8-.2V4a1 1 0 00-1-1z"/>
                </svg>
                <span>Broadcast</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 1rem;
    }

    .executive-summary {
      margin-bottom: 2rem;
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .summary-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .period-selector {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      font-size: 0.875rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: transform 0.2s ease;
    }

    .summary-card:hover {
      transform: translateY(-4px);
    }

    .summary-card.primary { border-left: 6px solid #3b82f6; }
    .summary-card.success { border-left: 6px solid #10b981; }
    .summary-card.warning { border-left: 6px solid #f59e0b; }
    .summary-card.info { border-left: 6px solid #06b6d4; }

    .summary-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .summary-card.primary .summary-icon { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .summary-card.success .summary-icon { background: linear-gradient(135deg, #10b981, #047857); }
    .summary-card.warning .summary-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .summary-card.info .summary-icon { background: linear-gradient(135deg, #06b6d4, #0891b2); }

    .summary-content {
      flex: 1;
    }

    .summary-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .summary-label {
      color: #6b7280;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .summary-change {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .summary-change.positive { color: #10b981; }
    .summary-change.negative { color: #ef4444; }

    .admin-grid {
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
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .card-body {
      padding: 1.5rem;
    }

    .overview-controls, .btn-control {
      display: flex;
      gap: 0.5rem;
    }

    .btn-control {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-control:hover {
      background: #f9fafb;
    }

    .btn-control.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .overview-content {
      margin-top: 1rem;
    }

    .overview-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .legend-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .legend-text {
      flex: 1;
      font-size: 0.875rem;
      color: #4b5563;
    }

    .legend-count {
      font-weight: 600;
      color: #1f2937;
    }

    .metrics-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .metric-item {
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .metric-title {
      font-size: 0.875rem;
      color: #4b5563;
    }

    .metric-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
    }

    .metric-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .bar-fill {
      height: 100%;
      background: #3b82f6;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .bar-fill.success { background: #10b981; }
    .bar-fill.warning { background: #f59e0b; }

    .metric-target {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .department-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .department-item {
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .dept-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .dept-name {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .dept-count {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .dept-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .dept-metric {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .dept-metric .metric-label {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .dept-metric .metric-value {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .financial-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .financial-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .financial-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .financial-icon.primary { background: #3b82f6; }
    .financial-icon.warning { background: #f59e0b; }
    .financial-icon.success { background: #10b981; }

    .financial-content {
      flex: 1;
    }

    .financial-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .financial-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .financial-change {
      font-size: 0.75rem;
      font-weight: 600;
    }

    .financial-change.positive { color: #10b981; }
    .financial-change.negative { color: #ef4444; }

    .health-indicators {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .health-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .health-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .health-status.healthy .status-dot { background: #10b981; }
    .health-status.warning .status-dot { background: #f59e0b; }
    .health-status.critical .status-dot { background: #ef4444; }

    .status-text {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .health-status.healthy .status-text { color: #10b981; }
    .health-status.warning .status-text { color: #f59e0b; }
    .health-status.critical .status-text { color: #ef4444; }

    .health-metric {
      display: flex;
      flex-direction: column;
      align-items: end;
      gap: 0.25rem;
    }

    .health-metric .metric-label {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .health-metric .metric-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1f2937;
    }

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .activity-icon.icon-allocation { background: #3b82f6; }
    .activity-icon.icon-issue { background: #f59e0b; }
    .activity-icon.icon-user { background: #10b981; }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      margin: 0 0 0.25rem;
      font-size: 0.875rem;
      color: #1f2937;
    }

    .activity-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .activity-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .activity-status.status-completed { background: #dcfce7; color: #166534; }
    .activity-status.status-pending { background: #fef3c7; color: #92400e; }
    .activity-status.status-failed { background: #fef2f2; color: #991b1b; }

    .admin-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .admin-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      transition: transform 0.2s ease;
    }

    .admin-action:hover {
      transform: translateY(-2px);
    }

    .admin-action.primary { background: #3b82f6; }
    .admin-action.success { background: #10b981; }
    .admin-action.info { background: #06b6d4; }
    .admin-action.warning { background: #f59e0b; }
    .admin-action.secondary { background: #6b7280; }
    .admin-action.danger { background: #ef4444; }

    .view-all-link {
      color: #3b82f6;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
    }
  `]
})
export class AdminDashboardComponent {
  @Input() dashboardStats: DashboardStats = {};
  
  overviewView: 'assets' | 'users' | 'issues' = 'assets';

  setOverviewView(view: 'assets' | 'users' | 'issues') {
    this.overviewView = view;
  }

  getUtilizationRate(): number {
    return Math.round(this.dashboardStats.assetUtilizationRate || 0);
  }

  getResolutionRate(): number {
    const totalIssues = this.dashboardStats.totalIssues || 0;
    const openIssues = this.dashboardStats.openIssues || 0;
    const resolvedIssues = totalIssues - openIssues;
    return totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
  }

  getUserSatisfaction(): number {
    // This would typically come from user feedback surveys
    // For now, calculate based on issue resolution rate
    const resolutionRate = this.getResolutionRate();
    return Math.min(95, Math.max(60, resolutionRate + 5));
  }

  getActiveUsersCount(): number {
    // Assuming most users are active - this should come from backend
    return Math.round((this.dashboardStats.totalUsers || 0) * 0.9);
  }

  getNewUsersCount(): number {
    // This should come from backend with actual date filtering
    return Math.round((this.dashboardStats.totalUsers || 0) * 0.05);
  }

  getAssetsByStatusArray() {
    if (!this.dashboardStats.assetsByStatus) return [];
    return Object.entries(this.dashboardStats.assetsByStatus).map(([key, value]) => ({ key, value }));
  }

  getDepartmentAnalytics() {
    if (!this.dashboardStats.assetsByDepartment) return [];
    
    return Object.entries(this.dashboardStats.assetsByDepartment).map(([name, assetCount]) => ({
      name,
      assetCount,
      userCount: Math.round(assetCount * 0.8), // Estimated based on asset count
      issueCount: Math.round(assetCount * 0.15), // Estimated based on asset count
      utilization: Math.round(75 + Math.random() * 20) // Random between 75-95%
    }));
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

  getAssetTrend(): string {
    // Calculate trend based on monthly asset data if available
    if (this.dashboardStats.monthlyAssetTrends) {
      const values = Object.values(this.dashboardStats.monthlyAssetTrends);
      if (values.length >= 2) {
        const current = values[values.length - 1];
        const previous = values[values.length - 2];
        const change = previous > 0 ? ((current - previous) / previous * 100) : 0;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% from last month`;
      }
    }
    return 'No trend data';
  }

  getUserTrend(): string {
    // Simplified trend calculation - in real app this would come from backend
    return '+2% from last month';
  }

  getIssueTrend(): string {
    // Calculate trend based on monthly issue data if available
    if (this.dashboardStats.monthlyIssueTrends) {
      const values = Object.values(this.dashboardStats.monthlyIssueTrends);
      if (values.length >= 2) {
        const current = values[values.length - 1];
        const previous = values[values.length - 2];
        const change = previous > 0 ? ((current - previous) / previous * 100) : 0;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% from last month`;
      }
    }
    return 'No trend data';
  }

  getIssueTrendClass(): string {
    if (this.dashboardStats.monthlyIssueTrends) {
      const values = Object.values(this.dashboardStats.monthlyIssueTrends);
      if (values.length >= 2) {
        const current = values[values.length - 1];
        const previous = values[values.length - 2];
        return current < previous ? 'positive' : 'negative';
      }
    }
    return 'neutral';
  }

  getUtilizationTrend(): string {
    // Simplified trend calculation - in real app this would come from backend
    const rate = this.getUtilizationRate();
    return rate > 80 ? '+2% from last month' : '+5% from last month';
  }

  getTotalAssetValue(): string {
    // Estimate based on asset count - in real app this would come from backend
    const totalAssets = this.dashboardStats.totalAssets || 0;
    const estimatedValue = totalAssets * 2500; // $2500 average per asset
    return this.formatCurrency(estimatedValue);
  }

  getMaintenanceCost(): string {
    // Estimate based on total assets - in real app this would come from backend
    const totalAssets = this.dashboardStats.totalAssets || 0;
    const estimatedCost = totalAssets * 50; // $50 per asset per month
    return this.formatCurrency(estimatedCost);
  }

  getCostSavings(): string {
    // Estimate based on efficiency - in real app this would come from backend
    const utilization = this.getUtilizationRate();
    const totalAssets = this.dashboardStats.totalAssets || 0;
    const savings = totalAssets * utilization * 10; // Savings based on utilization
    return this.formatCurrency(savings);
  }

  getAssetValueTrend(): string {
    return '+3.2%';
  }

  getMaintenanceTrend(): string {
    return '+8.5%';
  }

  getSavingsTrend(): string {
    return '+12.3%';
  }

  private formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  }
}