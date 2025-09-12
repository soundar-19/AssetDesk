import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RoleService } from '../../core/services/role.service';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner.component';

import { EmployeeDashboardComponent } from './employee-dashboard.component';
import { ITSupportDashboardComponent } from './it-support-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    LoadingSpinnerComponent, 

    EmployeeDashboardComponent,
    ITSupportDashboardComponent,
    AdminDashboardComponent
  ],
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
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  getDashboardDescription(): string {
    if (this.roleService.isEmployee()) {
      return 'View your assigned assets and track your issues';
    } else if (this.roleService.canManageUsers()) {
      return 'Manage assets, users, and monitor system-wide activities';
    } else {
      return 'Manage assets and handle support requests';
    }
  }

  loadDashboardData() {
    this.loading = true;
    console.log('Loading dashboard data...');
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        console.log('Dashboard stats received:', stats);
        this.dashboardStats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        console.error('Error details:', error.error);
        this.loading = false;
        // Set empty stats to prevent UI issues
        this.dashboardStats = {};
      }
    });
  }
}