import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  // Common stats
  totalAssets?: number;
  totalIssues?: number;
  
  // Role-specific stats
  myAssets?: number;
  myIssues?: number;
  myRequests?: number;
  availableAssets?: number;
  allocatedAssets?: number;
  openIssues?: number;
  totalUsers?: number;
  pendingRequests?: number;
  approvedRequests?: number;
  rejectedRequests?: number;
  fulfilledRequests?: number;
  
  // Charts data
  assetsByCategory?: { [key: string]: number };
  assetsByStatus?: { [key: string]: number };
  issuesByPriority?: { [key: string]: number };
  issuesByStatus?: { [key: string]: number };
  requestsByStatus?: { [key: string]: number };
  requestsByCategory?: { [key: string]: number };
  assetsByDepartment?: { [key: string]: number };
  monthlyAssetTrends?: { [key: string]: number };
  monthlyIssueTrends?: { [key: string]: number };
  monthlyRequestTrends?: { [key: string]: number };
  
  // Recent activities
  recentActivities?: RecentActivity[];
  upcomingWarranties?: UpcomingWarranty[];
  topIssues?: TopIssue[];
  
  // Performance metrics
  averageResolutionTime?: number;
  assetUtilizationRate?: number;
  warrantyExpiringCount?: number;
  maintenanceDueCount?: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
  user: string;
  status: string;
}

export interface UpcomingWarranty {
  assetId: number;
  assetName: string;
  warrantyEndDate: string;
  daysRemaining: number;
  vendor: string;
}

export interface TopIssue {
  issueId: number;
  title: string;
  priority: string;
  status: string;
  reportedBy: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}