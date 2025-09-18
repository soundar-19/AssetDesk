import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RoleService } from '../../core/services/role.service';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { AssetService } from '../../core/services/asset.service';

import { ToastService } from '../../shared/components/toast/toast.service';
import { Asset } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner.component';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { ChartComponent, ChartData } from '../../shared/components/chart/chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, MetricCardComponent, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardStats: DashboardStats = {};

  loading = true;
  currentUser: any = null;
  showAssetSelection = false;
  userAssets: Asset[] = [];

  constructor(
    private authService: AuthService,
    public roleService: RoleService,
    private dashboardService: DashboardService,
    private assetService: AssetService,

    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  getDashboardTitle(): string {
    if (this.roleService.isAdmin()) return 'Admin Dashboard';
    if (this.roleService.isITSupport()) return 'IT Support Dashboard';
    return 'My Dashboard';
  }

  getDashboardDescription(): string {
    if (this.roleService.isEmployee()) {
      return 'View your assigned assets and track your issues';
    } else if (this.roleService.isAdmin()) {
      return 'Manage assets, users, and monitor system-wide activities';
    } else {
      return 'Manage assets and handle support requests';
    }
  }

  loadDashboardData() {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
        this.dashboardStats = {};
      }
    });
  }

  getUtilizationRate(): number {
    const rate = this.dashboardStats.assetUtilizationRate || 0;
    return Math.max(0, Math.round(rate));
  }

  getTotalAssets(): number {
    return this.dashboardStats.totalAssets || 0;
  }

  getAssetsByStatusArray(): ChartData[] {
    if (!this.dashboardStats.assetsByStatus) return [];
    return Object.entries(this.dashboardStats.assetsByStatus).map(([key, value]) => ({ 
      label: this.formatStatus(key), 
      value 
    }));
  }

  getDepartmentAnalytics() {
    if (!this.dashboardStats.assetsByDepartment) return [];
    return Object.entries(this.dashboardStats.assetsByDepartment).map(([name, assetCount]) => ({
      name,
      assetCount,
      userCount: assetCount,
      utilization: this.getUtilizationRate()
    }));
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
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

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'ALLOCATION': '👤',
      'ISSUE': '🐛',
      'USER': '👥',
      'MAINTENANCE': '🔧',
      'REQUEST': '📝'
    };
    return icons[type] || '📋';
  }

  getAssetTrend(): string {
    if (this.dashboardStats.monthlyAssetTrends) {
      const values = Object.values(this.dashboardStats.monthlyAssetTrends);
      if (values.length >= 2) {
        const current = values[values.length - 1];
        const previous = values[values.length - 2];
        if (previous === 0 && current === 0) {
          return 'No change';
        }
        if (previous === 0) {
          return current > 0 ? `+${current} new assets` : 'No change';
        }
        const change = ((current - previous) / previous * 100);
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% this month`;
      }
    }
    return 'No data';
  }

  getIssueTrend(): string {
    if (this.dashboardStats.monthlyIssueTrends) {
      const values = Object.values(this.dashboardStats.monthlyIssueTrends);
      if (values.length >= 2) {
        const current = values[values.length - 1];
        const previous = values[values.length - 2];
        if (previous === 0 && current === 0) {
          return 'No change';
        }
        if (previous === 0) {
          return current > 0 ? `+${current} new issues` : 'No change';
        }
        const change = ((current - previous) / previous * 100);
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% this month`;
      }
    }
    return 'No data';
  }

  getRequestTrend(): string {
    const pending = this.dashboardStats.pendingRequests || 0;
    if (pending > 0) {
      return `${pending} pending`;
    }
    return 'All processed';
  }

  getRequestsByStatusArray() {
    if (!this.dashboardStats.requestsByStatus) return [];
    return Object.entries(this.dashboardStats.requestsByStatus).map(([key, value]) => ({ key, value }));
  }

  getTotalRequests(): number {
    return this.dashboardStats.myRequests || 0;
  }

  getAssetCategoriesArray(): ChartData[] {
    if (!this.dashboardStats.assetsByCategory) return [];
    return Object.entries(this.dashboardStats.assetsByCategory).map(([key, value]) => ({ 
      label: key, 
      value 
    }));
  }

  getMyAssetCount(status: string): number {
    if (status === 'ALLOCATED') return this.dashboardStats.myAssets || 0;
    if (status === 'MAINTENANCE') return this.dashboardStats.myIssues || 0;
    return 0;
  }

  getMyAssetPercentage(status: string): number {
    const total = this.dashboardStats.myAssets || 1;
    const count = this.getMyAssetCount(status);
    return Math.round((count / total) * 100);
  }

  getActiveUsers(): number {
    return this.dashboardStats.totalUsers || 0;
  }

  navigateToRequests() {
    this.router.navigate(['/requests']);
  }

  showAssetSelectionForIssue() {
    this.loadUserAssets();
    this.showAssetSelection = true;
  }

  loadUserAssets() {
    if (this.currentUser?.id) {
      this.assetService.getAssetsByUser(this.currentUser.id, 0, 100).subscribe({
        next: (response) => {
          this.userAssets = response.content || [];
        },
        error: (error) => {
          console.error('Error loading user assets:', error);
          this.userAssets = [];
        }
      });
    }
  }

  selectAssetForIssue(asset: Asset) {
    this.showAssetSelection = false;
    this.router.navigate(['/assets', asset.id, 'issue']);
  }

  closeAssetSelection() {
    this.showAssetSelection = false;
  }


}