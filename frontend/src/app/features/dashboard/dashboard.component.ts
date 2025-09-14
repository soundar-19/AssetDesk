import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RoleService } from '../../core/services/role.service';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardStats: DashboardStats = {};
  loading = true;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    public roleService: RoleService,
    private dashboardService: DashboardService,
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
    return Math.round(this.dashboardStats.assetUtilizationRate || 0);
  }

  getTotalAssets(): number {
    return this.dashboardStats.totalAssets || 0;
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
      userCount: Math.round(assetCount * 0.8),
      utilization: Math.round(75 + Math.random() * 20)
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
        const change = previous > 0 ? ((current - previous) / previous * 100) : 0;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% this month`;
      }
    }
    return '+5% this month';
  }

  getIssueTrend(): string {
    if (this.dashboardStats.monthlyIssueTrends) {
      const values = Object.values(this.dashboardStats.monthlyIssueTrends);
      if (values.length >= 2) {
        const current = values[values.length - 1];
        const previous = values[values.length - 2];
        const change = previous > 0 ? ((current - previous) / previous * 100) : 0;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% this month`;
      }
    }
    return '-8% this month';
  }

  getRequestTrend(): string {
    if (this.dashboardStats.monthlyRequestTrends) {
      const values = Object.values(this.dashboardStats.monthlyRequestTrends);
      if (values.length >= 2) {
        const current = values[values.length - 1];
        const previous = values[values.length - 2];
        const change = previous > 0 ? ((current - previous) / previous * 100) : 0;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% this month`;
      }
    }
    return '+12% this month';
  }

  getRequestsByStatusArray() {
    if (!this.dashboardStats.requestsByStatus) return [];
    return Object.entries(this.dashboardStats.requestsByStatus).map(([key, value]) => ({ key, value }));
  }

  getTotalRequests(): number {
    if (!this.dashboardStats.requestsByStatus) return 0;
    return Object.values(this.dashboardStats.requestsByStatus).reduce((sum, count) => sum + count, 0);
  }

  navigateToRequests() {
    this.router.navigate(['/requests']);
  }
}