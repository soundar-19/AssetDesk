import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AllocationService } from '../../core/services/allocation.service';
import { AssetService } from '../../core/services/asset.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { InputModalService } from '../../shared/components/input-modal/input-modal.service';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-admin-return-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Return Requests</h1>
          <p class="page-description">Manage all asset return requests and their status</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="refreshData()">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Return Request Statistics -->
      <div class="request-stats">
        <div class="stats-grid">
          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">Pending</div>
            </div>
          </div>
          <div class="stat-card acknowledged">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.acknowledged }}</div>
              <div class="stat-label">Acknowledged</div>
            </div>
          </div>
          <div class="stat-card overdue">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.overdue }}</div>
              <div class="stat-label">Overdue</div>
            </div>
          </div>
          <div class="stat-card total">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">Total</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Section with Tabs and Filters -->
      <div class="table-section">
        <!-- Tabs -->
        <div class="tabs-container">
          <div class="tabs">
            <button class="tab" [class.active]="activeTab === 'pending'" (click)="setActiveTab('pending')">
              Pending Returns
            </button>
            <button class="tab" [class.active]="activeTab === 'all'" (click)="setActiveTab('all')">
              All Returns
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-section">
          <div class="filters">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
              <option value="">All Status</option>
              <option value="REQUESTED">Pending</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            
            <select class="form-select" [(ngModel)]="categoryFilter" (change)="applyFilters()">
              <option value="">All Categories</option>
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="ACCESSORIES">Accessories</option>
            </select>
            
            <input type="text" 
                   class="form-control" 
                   placeholder="Search returns..." 
                   [(ngModel)]="searchTerm"
                   (input)="onSearchChange()">
          </div>
          
          <div class="filter-actions">
            <button class="btn btn-outline btn-sm" (click)="clearFilters()" *ngIf="hasActiveFilters()">
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Returns Table -->
        <div class="requests-table" *ngIf="!loading && filteredRequests.length > 0">
          <app-data-table
            [data]="filteredRequests"
            [columns]="columns"
            [actions]="actions"
            [pagination]="pagination"
            [rowClickAction]="true"
            (pageChange)="onPageChange($event)"
            (rowClick)="viewAsset($event)">
          </app-data-table>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredRequests.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No return requests found</h3>
          <p *ngIf="hasActiveFilters()">No return requests match your current filters.</p>
          <p *ngIf="!hasActiveFilters()">No asset return requests have been submitted yet.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading return requests...</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
      padding: var(--space-4);
      background: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }
    
    .page-title {
      margin: 0 0 var(--space-1-5) 0;
      color: var(--gray-900);
      font-size: var(--text-xl);
      font-weight: 700;
    }
    
    .page-description {
      margin: 0;
      color: var(--gray-600);
      font-size: var(--text-sm);
    }
    
    .header-actions {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }
    
    .request-stats {
      background: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--space-3);
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      transition: transform var(--transition-fast);
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
    }
    
    .stat-card.pending {
      background: var(--warning-50);
      border: 1px solid var(--warning-200);
    }
    
    .stat-card.acknowledged {
      background: var(--success-50);
      border: 1px solid var(--success-200);
    }
    
    .stat-card.overdue {
      background: var(--error-50);
      border: 1px solid var(--error-200);
    }
    
    .stat-card.total {
      background: var(--primary-50);
      border: 1px solid var(--primary-200);
    }
    
    .stat-icon {
      font-size: 1.5rem;
    }
    
    .stat-value {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1;
    }
    
    .stat-label {
      color: var(--gray-600);
      font-size: var(--text-xs);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    .table-section {
      background: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }
    
    .tabs-container {
      border-bottom: 1px solid var(--gray-200);
    }
    
    .tabs {
      display: flex;
      background: white;
    }
    
    .tab {
      padding: var(--space-2-5) var(--space-4);
      background: white;
      border: none;
      font-weight: 500;
      color: var(--gray-600);
      cursor: pointer;
      transition: all var(--transition-fast);
      border-right: 1px solid var(--gray-200);
      border-bottom: 2px solid transparent;
    }
    
    .tab:last-child {
      border-right: none;
    }
    
    .tab:hover {
      background: var(--gray-50);
      color: var(--gray-900);
    }
    
    .tab.active {
      background: white;
      color: var(--primary-600);
      border-bottom-color: var(--primary-600);
    }
    
    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3);
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
    }
    
    .filters {
      display: flex;
      gap: var(--space-2-5);
      flex: 1;
      align-items: center;
    }
    
    .form-select, .form-control {
      min-width: 120px;
      padding: var(--space-2) var(--space-2-5);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      background: white;
    }
    
    .form-control {
      min-width: 160px;
    }
    
    .filter-actions {
      display: flex;
      gap: var(--space-2);
    }
    
    .requests-table {
      background: white;
    }
    
    .empty-state, .loading-state {
      text-align: center;
      padding: var(--space-12);
      color: var(--gray-500);
    }
    
    .empty-icon {
      font-size: 3rem;
      margin-bottom: var(--space-4);
    }
    
    .loading-spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid var(--gray-200);
      border-top: 3px solid var(--primary-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto var(--space-4);
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .btn {
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: var(--text-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: var(--space-1-5);
    }
    
    .btn-sm {
      padding: var(--space-1-5) var(--space-2-5);
      font-size: var(--text-xs);
    }
    
    .btn-primary {
      background: var(--primary-600);
      color: white;
      border-color: var(--primary-600);
    }
    
    .btn-primary:hover {
      background: var(--primary-700);
      border-color: var(--primary-700);
    }
    
    .btn-outline {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
    }
    
    .btn-outline:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }
    
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: var(--space-4);
      }
      
      .header-actions {
        align-self: stretch;
        justify-content: stretch;
      }
      
      .header-actions .btn {
        flex: 1;
        justify-content: center;
      }
      
      .filters-section {
        flex-direction: column;
        gap: var(--space-3);
        align-items: stretch;
      }
      
      .filters {
        flex-direction: column;
        gap: var(--space-2);
      }
      
      .form-select, .form-control {
        min-width: auto;
        width: 100%;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminReturnRequestsComponent implements OnInit {
  loading = true;
  returnRequests: any[] = [];
  filteredRequests: any[] = [];
  pagination: any = null;
  
  // Filters
  statusFilter = '';
  categoryFilter = '';
  searchTerm = '';
  searchTimeout: any;
  
  // Tabs
  activeTab = 'pending';
  
  stats = { pending: 0, acknowledged: 0, overdue: 0, total: 0 };

  columns: TableColumn[] = [
    { key: 'assetTag', label: 'Asset Tag' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'userName', label: 'User' },
    { key: 'returnRequestDate', label: 'Requested', render: (item) => new Date(item.returnRequestDate).toLocaleDateString() },
    { key: 'returnStatus', label: 'Status', badge: true },
    { key: 'daysOverdue', label: 'Days', render: (item) => this.getDaysOverdue(item) }
  ];

  actions: TableAction[] = [
    {
      label: 'Send Reminder',
      action: (request) => this.sendReminder(request),
      condition: (request) => request.returnStatus !== 'COMPLETED'
    },
    {
      label: 'Force Return',
      action: (request) => this.forceReturn(request),
      condition: (request) => request.returnStatus === 'ACKNOWLEDGED'
    },
    {
      label: 'View Asset',
      action: (request) => this.viewAsset(request)
    }
  ];

  constructor(
    private router: Router,
    private allocationService: AllocationService,
    private assetService: AssetService,
    private toastService: ToastService,
    private inputModalService: InputModalService
  ) {}

  ngOnInit() {
    this.statusFilter = 'REQUESTED'; // Default to pending
    this.loadReturnRequests();
  }

  loadReturnRequests(page: number = 0) {
    this.loading = true;
    this.allocationService.getPendingReturns().subscribe({
      next: (requests) => {
        this.returnRequests = requests || [];
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.returnRequests = [];
        this.filteredRequests = [];
        this.toastService.error('Failed to load return requests');
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.stats.pending = this.returnRequests.filter(r => r.returnStatus === 'REQUESTED').length;
    this.stats.acknowledged = this.returnRequests.filter(r => r.returnStatus === 'ACKNOWLEDGED').length;
    this.stats.overdue = this.returnRequests.filter(r => this.isOverdue(r)).length;
    this.stats.total = this.returnRequests.length;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'pending') {
      this.statusFilter = 'REQUESTED';
    } else {
      this.statusFilter = '';
    }
    this.applyFilters();
  }

  applyFilters() {
    this.filteredRequests = this.returnRequests.filter(request => {
      // Status filter
      if (this.statusFilter === 'OVERDUE') {
        if (!this.isOverdue(request)) return false;
      } else if (this.statusFilter && request.returnStatus !== this.statusFilter) {
        return false;
      }
      
      // Category filter
      if (this.categoryFilter && request.assetCategory !== this.categoryFilter) {
        return false;
      }
      
      // Search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesAsset = request.assetName?.toLowerCase().includes(searchLower);
        const matchesTag = request.assetTag?.toLowerCase().includes(searchLower);
        const matchesUser = request.userName?.toLowerCase().includes(searchLower);
        if (!matchesAsset && !matchesTag && !matchesUser) {
          return false;
        }
      }
      
      return true;
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  hasActiveFilters(): boolean {
    return !!(this.statusFilter || this.categoryFilter || this.searchTerm);
  }

  clearFilters() {
    this.statusFilter = '';
    this.categoryFilter = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  isOverdue(request: any): boolean {
    const requestDate = new Date(request.returnRequestDate);
    const daysDiff = Math.floor((Date.now() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 3; // Consider overdue after 3 days
  }

  getDaysOverdue(request: any): string {
    const requestDate = new Date(request.returnRequestDate);
    const daysDiff = Math.floor((Date.now() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 3 ? `${daysDiff} days` : '-';
  }

  async sendReminder(request: any) {
    const message = await this.inputModalService.promptText(
      'Send Reminder',
      `Send reminder to ${request.userName}`,
      'Custom reminder message (optional)...',
      `Please return ${request.assetName} as soon as possible.`,
      false
    );

    if (message !== null) {
      // In a real app, this would call a reminder API
      this.toastService.success(`Reminder sent to ${request.userName}`);
    }
  }

  async forceReturn(request: any) {
    const assetId = request.assetId;
    const remarks = await this.inputModalService.promptText(
      'Force Return Asset',
      `Force return ${request.assetName}`,
      'Enter reason for force return...',
      'Asset forcibly returned by admin',
      false
    );

    if (remarks !== null) {
      this.assetService.returnAsset(assetId, remarks || 'Asset forcibly returned by admin').subscribe({
        next: () => {
          this.toastService.success('Asset returned successfully');
          this.loadReturnRequests();
        },
        error: () => this.toastService.error('Failed to return asset')
      });
    }
  }

  viewAsset(request: any) {
    this.router.navigate(['/assets', request.assetId]);
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  refreshData() {
    this.loadReturnRequests();
  }

  onPageChange(page: number) {
    this.loadReturnRequests(page);
  }
}