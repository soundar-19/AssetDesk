import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardStats } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="employee-dashboard">
      <!-- Quick Stats -->
      <section class="stats-grid" aria-label="Employee Statistics">
        <div class="stat-card primary">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2H3zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardStats.myAssets || 0 }}</div>
            <div class="stat-label">My Assets</div>
          </div>
          <div class="stat-action">
            <a routerLink="/assets/user-assets" class="btn-link">View All</a>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardStats.myIssues || 0 }}</div>
            <div class="stat-label">My Issues</div>
          </div>
          <div class="stat-action">
            <a routerLink="/issues/my-issues" class="btn-link">View All</a>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2V3a2 2 0 012 2v6a4 4 0 01-4 4H6a4 4 0 01-4-4V5z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardStats.pendingRequests || 0 }}</div>
            <div class="stat-label">Pending Requests</div>
          </div>
          <div class="stat-action">
            <a routerLink="/assets/requests" class="btn-link">View All</a>
          </div>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div class="dashboard-grid">
        <!-- My Assets Overview -->
        <section class="card assets-overview">
          <header class="card-header">
            <h2 class="card-title">My Assets Overview</h2>
          </header>
          <div class="card-body">
            <div *ngIf="hasAssetsByCategory()" class="chart-container">
              <div class="chart-legend">
                <div *ngFor="let item of getAssetsByCategoryArray()" class="legend-item">
                  <span class="legend-color" [style.background-color]="getCategoryColor(item.key)"></span>
                  <span class="legend-label">{{ item.key }}</span>
                  <span class="legend-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
            <div *ngIf="!hasAssetsByCategory()" class="empty-chart">
              <p>No assets assigned yet</p>
              <a routerLink="/assets/requests" class="btn btn-primary">Request Asset</a>
            </div>
          </div>
        </section>

        <!-- My Issues Status -->
        <section class="card issues-status">
          <header class="card-header">
            <h2 class="card-title">My Issues Status</h2>
          </header>
          <div class="card-body">
            <div *ngIf="hasIssuesByStatus()" class="status-grid">
              <div *ngFor="let item of getIssuesByStatusArray()" class="status-item">
                <div class="status-indicator" [class]="'status-' + item.key.toLowerCase()"></div>
                <div class="status-content">
                  <div class="status-count">{{ item.value }}</div>
                  <div class="status-label">{{ formatStatus(item.key) }}</div>
                </div>
              </div>
            </div>
            <div *ngIf="!hasIssuesByStatus()" class="empty-chart">
              <p>No issues reported</p>
            </div>
          </div>
        </section>

        <!-- Recent Activities -->
        <section class="card recent-activities">
          <header class="card-header">
            <h2 class="card-title">Recent Activities</h2>
          </header>
          <div class="card-body">
            <div *ngIf="dashboardStats.recentActivities && dashboardStats.recentActivities.length > 0" class="activities-list">
              <div *ngFor="let activity of dashboardStats.recentActivities" class="activity-item">
                <div class="activity-icon" [class]="'activity-' + activity.type.toLowerCase()">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path *ngIf="activity.type === 'ALLOCATION'" d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2H3zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path *ngIf="activity.type === 'ISSUE'" fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
                  </svg>
                </div>
                <div class="activity-content">
                  <p class="activity-description">{{ activity.description }}</p>
                  <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                </div>
                <div class="activity-status" [class]="'status-' + activity.status.toLowerCase()">
                  {{ formatStatus(activity.status) }}
                </div>
              </div>
            </div>
            <div *ngIf="!dashboardStats.recentActivities || dashboardStats.recentActivities.length === 0" class="empty-state">
              <p>No recent activities</p>
            </div>
          </div>
        </section>

        <!-- Upcoming Warranties -->
        <section class="card upcoming-warranties" *ngIf="dashboardStats.upcomingWarranties && dashboardStats.upcomingWarranties.length > 0">
          <header class="card-header">
            <h2 class="card-title">Warranty Alerts</h2>
          </header>
          <div class="card-body">
            <div class="warranties-list">
              <div *ngFor="let warranty of dashboardStats.upcomingWarranties" class="warranty-item">
                <div class="warranty-info">
                  <h4 class="warranty-asset">{{ warranty.assetName }}</h4>
                  <p class="warranty-vendor">{{ warranty.vendor }}</p>
                </div>
                <div class="warranty-alert">
                  <span class="days-remaining" [class]="getWarrantyAlertClass(warranty.daysRemaining)">
                    {{ warranty.daysRemaining }} days
                  </span>
                  <span class="warranty-date">{{ formatDate(warranty.warrantyEndDate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- My Top Issues -->
        <section class="card top-issues" *ngIf="dashboardStats.topIssues && dashboardStats.topIssues.length > 0">
          <header class="card-header">
            <h2 class="card-title">My Active Issues</h2>
          </header>
          <div class="card-body">
            <div class="issues-list">
              <div *ngFor="let issue of dashboardStats.topIssues" class="issue-item">
                <div class="issue-priority" [class]="'priority-' + issue.priority.toLowerCase()"></div>
                <div class="issue-content">
                  <h4 class="issue-title">{{ issue.title }}</h4>
                  <span class="issue-date">{{ formatDate(issue.createdAt) }}</span>
                </div>
                <div class="issue-status" [class]="'status-' + issue.status.toLowerCase()">
                  {{ formatStatus(issue.status) }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="card quick-actions">
          <header class="card-header">
            <h2 class="card-title">Quick Actions</h2>
          </header>
          <div class="card-body">
            <div class="actions-grid">
              <a routerLink="/assets/requests" class="action-btn primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                </svg>
                Request Asset
              </a>
              <a routerLink="/issues" class="action-btn warning">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
                </svg>
                Report Issue
              </a>
              <a routerLink="/profile" class="action-btn info">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
                My Profile
              </a>
              <a routerLink="/messages" class="action-btn secondary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                Messages
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .employee-dashboard {
      padding: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-card.primary { border-left: 4px solid #3b82f6; }
    .stat-card.warning { border-left: 4px solid #f59e0b; }
    .stat-card.info { border-left: 4px solid #06b6d4; }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-card.primary .stat-icon { background: #3b82f6; }
    .stat-card.warning .stat-icon { background: #f59e0b; }
    .stat-card.info .stat-icon { background: #06b6d4; }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .stat-label {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .btn-link {
      color: #3b82f6;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
    }

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
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .card-body {
      padding: 1.5rem;
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
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-indicator.status-open { background: #ef4444; }
    .status-indicator.status-in_progress { background: #f59e0b; }
    .status-indicator.status-resolved { background: #10b981; }
    .status-indicator.status-closed { background: #6b7280; }

    .status-count {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .status-label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
    }

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
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

    .activity-icon.activity-allocation { background: #3b82f6; }
    .activity-icon.activity-issue { background: #f59e0b; }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      margin: 0;
      font-size: 0.875rem;
      color: #1f2937;
    }

    .activity-time {
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
    .activity-status.status-open { background: #fef2f2; color: #991b1b; }
    .activity-status.status-in_progress { background: #fef3c7; color: #92400e; }

    .warranties-list, .issues-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .warranty-item, .issue-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .warranty-info, .issue-content {
      flex: 1;
    }

    .warranty-asset, .issue-title {
      margin: 0 0 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1f2937;
    }

    .warranty-vendor, .issue-date {
      margin: 0;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .warranty-alert {
      text-align: right;
    }

    .days-remaining {
      display: block;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .days-remaining.critical { color: #ef4444; }
    .days-remaining.warning { color: #f59e0b; }
    .days-remaining.normal { color: #10b981; }

    .warranty-date {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .issue-priority {
      width: 4px;
      height: 40px;
      border-radius: 2px;
    }

    .issue-priority.priority-high { background: #ef4444; }
    .issue-priority.priority-medium { background: #f59e0b; }
    .issue-priority.priority-low { background: #10b981; }

    .issue-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .issue-status.status-open { background: #fef2f2; color: #991b1b; }
    .issue-status.status-in_progress { background: #fef3c7; color: #92400e; }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: transform 0.2s ease;
    }

    .action-btn:hover {
      transform: translateY(-2px);
    }

    .action-btn.primary { background: #3b82f6; color: white; }
    .action-btn.warning { background: #f59e0b; color: white; }
    .action-btn.info { background: #06b6d4; color: white; }
    .action-btn.secondary { background: #6b7280; color: white; }

    .empty-chart, .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      display: inline-block;
      margin-top: 1rem;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }
  `]
})
export class EmployeeDashboardComponent {
  @Input() dashboardStats: DashboardStats = {};

  hasAssetsByCategory(): boolean {
    return !!(this.dashboardStats.assetsByCategory && Object.keys(this.dashboardStats.assetsByCategory).length > 0);
  }

  hasIssuesByStatus(): boolean {
    return !!(this.dashboardStats.issuesByStatus && Object.keys(this.dashboardStats.issuesByStatus).length > 0);
  }

  getAssetsByCategoryArray() {
    if (!this.dashboardStats.assetsByCategory) return [];
    return Object.entries(this.dashboardStats.assetsByCategory).map(([key, value]) => ({ key, value }));
  }

  getIssuesByStatusArray() {
    if (!this.dashboardStats.issuesByStatus) return [];
    return Object.entries(this.dashboardStats.issuesByStatus).map(([key, value]) => ({ key, value }));
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
}