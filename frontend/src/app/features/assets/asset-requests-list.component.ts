import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { RequestService } from '../../core/services/request.service';
import { RoleService } from '../../core/services/role.service';
import { AuthService } from '../../core/services/auth.service';
import { AssetRequest } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-asset-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Asset Requests</h1>
          <p class="page-description">
            {{ roleService.isEmployee() ? 'Your asset requests' : 'Manage asset requests' }}
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="refreshRequests()">
            🔄 Refresh
          </button>
          <button class="btn btn-primary" (click)="createRequest()">
            + New Request
          </button>
        </div>
      </div>

      <!-- Request Statistics -->
      <div class="request-stats">
        <div class="stats-grid">
          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-value">{{ getRequestCount('PENDING') }}</div>
              <div class="stat-label">Pending</div>
            </div>
          </div>
          <div class="stat-card approved">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ getRequestCount('APPROVED') }}</div>
              <div class="stat-label">Approved</div>
            </div>
          </div>
          <div class="stat-card rejected">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <div class="stat-value">{{ getRequestCount('REJECTED') }}</div>
              <div class="stat-label">Rejected</div>
            </div>
          </div>
          <div class="stat-card fulfilled">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-value">{{ getRequestCount('FULFILLED') }}</div>
              <div class="stat-label">Fulfilled</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Section with Tabs and Filters -->
      <div class="table-section">
        <!-- Tabs for IT Support and Admin -->
        <div class="tabs-container" *ngIf="!roleService.isEmployee()">
          <div class="tabs">
            <button class="tab" [class.active]="activeTab === 'pending'" (click)="setActiveTab('pending')">
              Pending Requests
            </button>
            <button class="tab" [class.active]="activeTab === 'all'" (click)="setActiveTab('all')">
              All Requests
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-section">
          <div class="filters">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            
            <select class="form-select" [(ngModel)]="priorityFilter" (change)="applyFilters()">
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            
            <select class="form-select" [(ngModel)]="categoryFilter" (change)="applyFilters()">
              <option value="">All Categories</option>
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="ACCESSORIES">Accessories</option>
            </select>
            
            <input type="text" 
                   class="form-control" 
                   placeholder="Search requests..." 
                   [(ngModel)]="searchTerm"
                   (input)="onSearchChange()">
          </div>
          
          <div class="filter-actions">
            <button class="btn btn-outline btn-sm" (click)="clearFilters()" *ngIf="hasActiveFilters()">
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Requests Table -->
        <div class="requests-table" *ngIf="!loading && filteredRequests.length > 0">
          <app-data-table
            [data]="filteredRequests"
            [columns]="columns"
            [pagination]="pagination"
            [rowClickAction]="onRequestClick"
            (pageChange)="onPageChange($event)">
          </app-data-table>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredRequests.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No requests found</h3>
          <p *ngIf="hasActiveFilters()">No requests match your current filters.</p>
          <p *ngIf="!hasActiveFilters() && roleService.isEmployee()">You haven't submitted any asset requests yet.</p>
          <p *ngIf="!hasActiveFilters() && !roleService.isEmployee()">No asset requests have been submitted yet.</p>
          <button class="btn btn-primary" (click)="createRequest()" *ngIf="!hasActiveFilters()">
            {{ roleService.isEmployee() ? 'Submit Your First Request' : 'Create First Request' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading requests...</p>
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
    
    .stat-card.approved {
      background: var(--success-50);
      border: 1px solid var(--success-200);
    }
    
    .stat-card.rejected {
      background: var(--error-50);
      border: 1px solid var(--error-200);
    }
    
    .stat-card.fulfilled {
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
    
    .requests-table :deep(.data-table) {
      width: 100%;
      table-layout: fixed;
      font-size: 0.875rem;
    }
    
    .requests-table :deep(.data-table th),
    .requests-table :deep(.data-table td) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0.5rem 0.25rem;
      max-width: 0;
    }
    
    .requests-table :deep(.data-table th:nth-child(1)),
    .requests-table :deep(.data-table td:nth-child(1)) {
      width: 60px;
    }
    
    .requests-table :deep(.data-table th:nth-child(2)),
    .requests-table :deep(.data-table td:nth-child(2)) {
      width: 150px;
    }
    
    .requests-table :deep(.data-table th:nth-child(3)),
    .requests-table :deep(.data-table td:nth-child(3)) {
      width: 80px;
    }
    
    .requests-table :deep(.data-table th:nth-child(4)),
    .requests-table :deep(.data-table td:nth-child(4)) {
      width: 80px;
    }
    
    .requests-table :deep(.data-table th:nth-child(5)),
    .requests-table :deep(.data-table td:nth-child(5)) {
      width: 80px;
    }
    
    .requests-table :deep(.data-table th:nth-child(6)),
    .requests-table :deep(.data-table td:nth-child(6)) {
      width: 90px;
    }
    
    .requests-table :deep(.data-table th:nth-child(7)),
    .requests-table :deep(.data-table td:nth-child(7)) {
      width: 90px;
    }
    
    .requests-table :deep(.data-table th:nth-child(8)),
    .requests-table :deep(.data-table td:nth-child(8)) {
      width: 90px;
    }
    
    .requests-table :deep(.badge) {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .requests-table :deep(.badge-warning) {
      background: #fef3c7;
      color: #92400e;
    }
    
    .requests-table :deep(.badge-success) {
      background: #dcfce7;
      color: #166534;
    }
    
    .requests-table :deep(.badge-error) {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .requests-table :deep(.badge-info) {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .requests-table :deep(.badge-secondary) {
      background: #f3f4f6;
      color: #374151;
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
export class AssetRequestsListComponent implements OnInit {
  loading = true;
  requests: AssetRequest[] = [];
  filteredRequests: AssetRequest[] = [];
  pagination: any = null;
  
  // Filters
  statusFilter = '';
  priorityFilter = '';
  categoryFilter = '';
  searchTerm = '';
  searchTimeout: any;
  
  // Tabs
  activeTab = 'pending';
  
  // Table configuration
  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'assetName', label: 'Asset', sortable: true, render: (request: AssetRequest) => this.truncateText(request.assetName, 25) },
    { key: 'category', label: 'Category' },
    { key: 'assetType', label: 'Type' },
    { key: 'priority', label: 'Priority', render: (request: AssetRequest) => this.getPriorityBadge(request.priority) },
    { key: 'status', label: 'Status', render: (request: AssetRequest) => this.getStatusBadge(request.status) },
    { key: 'requestedDate', label: 'Requested', pipe: 'date' },
    { key: 'requiredDate', label: 'Required', pipe: 'date' }
  ];

  actions: TableAction[] = [
    { 
      label: 'Edit', 
      icon: '✏', 
      action: (request) => this.editRequest(request.id), 
      condition: (request) => request.status === 'PENDING' && this.canEditRequest(request)
    },
    { 
      label: 'Approve', 
      icon: '✅', 
      action: (request) => this.approveRequest(request), 
      condition: (request) => request.status === 'PENDING' && this.roleService.canApproveRequests()
    },
    { 
      label: 'Reject', 
      icon: '❌', 
      action: (request) => this.rejectRequest(request), 
      condition: (request) => request.status === 'PENDING' && this.roleService.canApproveRequests()
    },
    { 
      label: 'Fulfill', 
      icon: '📦', 
      action: (request) => this.fulfillRequest(request), 
      condition: (request) => request.status === 'APPROVED' && this.roleService.canFulfillRequests()
    },
    { 
      label: 'Cancel', 
      icon: '🚫', 
      action: (request) => this.cancelRequest(request), 
      condition: (request) => request.status === 'PENDING' && this.canEditRequest(request)
    }
  ];

  constructor(
    private requestService: RequestService,
    public roleService: RoleService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.setupColumnsBasedOnRole();
    if (!this.roleService.isEmployee()) {
      this.statusFilter = 'PENDING';
    }
    this.loadRequests();
  }
  
  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'pending') {
      this.statusFilter = 'PENDING';
    } else {
      this.statusFilter = '';
    }
    this.applyFilters();
  }

  setupColumnsBasedOnRole() {
    if (!this.roleService.isEmployee()) {
      // Add requester column for admin/IT support
      this.columns.splice(1, 0, {
        key: 'requestedBy',
        label: 'Requested By',
        render: (request: AssetRequest) => request.requestedBy?.name || 'N/A'
      });
    }
  }

  loadRequests(page: number = 0) {
    this.loading = true;
    
    if (this.roleService.isEmployee()) {
      // Load only current user's requests
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.requestService.getRequestsByUser(currentUser.id, page, 20).subscribe({
          next: (response) => {
            this.requests = (response.content || []).sort((a, b) => 
              new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());
            this.applyFilters();
            this.pagination = {
              page: response.number || 0,
              totalPages: response.totalPages || 0,
              totalElements: response.totalElements || 0
            };
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading user requests:', error);
            this.toastService.error('Failed to load your requests');
            this.requests = [];
            this.filteredRequests = [];
            this.loading = false;
          }
        });
      }
    } else {
      // Load all requests for admin/IT support
      this.requestService.getAllRequests(page, 20).subscribe({
        next: (response) => {
          this.requests = (response.content || []).sort((a, b) => 
            new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());
          this.applyFilters();
          this.pagination = {
            page: response.number || 0,
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading all requests:', error);
          this.toastService.error('Failed to load requests');
          this.requests = [];
          this.filteredRequests = [];
          this.loading = false;
        }
      });
    }
  }

  applyFilters() {
    this.filteredRequests = this.requests.filter(request => {
      // Status filter
      if (this.statusFilter && request.status !== this.statusFilter) {
        return false;
      }
      
      // Priority filter
      if (this.priorityFilter && request.priority !== this.priorityFilter) {
        return false;
      }
      
      // Category filter
      if (this.categoryFilter && request.category !== this.categoryFilter) {
        return false;
      }
      
      // Search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesName = request.assetName.toLowerCase().includes(searchLower);
        const matchesId = request.id.toString().includes(searchLower);
        const matchesJustification = request.businessJustification?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesId && !matchesJustification) {
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
    return !!(this.statusFilter || this.priorityFilter || this.categoryFilter || this.searchTerm);
  }

  clearFilters() {
    this.statusFilter = '';
    this.priorityFilter = '';
    this.categoryFilter = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  getRequestCount(status: string): number {
    return this.requests.filter(request => request.status === status).length;
  }

  getPriorityBadge(priority: string): string {
    const badges: { [key: string]: string } = {
      'URGENT': '<span class="badge badge-error">Urgent</span>',
      'HIGH': '<span class="badge badge-warning">High</span>',
      'MEDIUM': '<span class="badge badge-info">Medium</span>',
      'LOW': '<span class="badge badge-success">Low</span>'
    };
    return badges[priority] || `<span class="badge badge-secondary">${priority}</span>`;
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      'PENDING': '<span class="badge badge-warning">Pending</span>',
      'APPROVED': '<span class="badge badge-success">Approved</span>',
      'REJECTED': '<span class="badge badge-error">Rejected</span>',
      'FULFILLED': '<span class="badge badge-info">Fulfilled</span>',
      'CANCELLED': '<span class="badge badge-secondary">Cancelled</span>'
    };
    return badges[status] || `<span class="badge badge-secondary">${status}</span>`;
  }

  canEditRequest(request: AssetRequest): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === request.requestedBy?.id;
  }

  onPageChange(page: number) {
    this.loadRequests(page);
  }

  refreshRequests() {
    this.loadRequests();
    this.toastService.success('Requests refreshed');
  }

  exportRequests() {
    this.toastService.info('Exporting requests...');
    // Implement export functionality
  }

  createRequest() {
    this.router.navigate(['/requests/new']);
  }

  viewRequest(id: number) {
    this.router.navigate(['/requests', id]);
  }

  editRequest(id: number) {
    this.router.navigate(['/requests', id, 'edit']);
  }

  fulfillRequest(request: AssetRequest) {
    this.router.navigate(['/requests', request.id]);
  }

  approveRequest(request: AssetRequest) {
    this.confirmDialog.confirm(
      'Approve Request',
      `Are you sure you want to approve the request for "${request.assetName}"?`
    ).subscribe(confirmed => {
      if (confirmed) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.requestService.approveRequest(request.id, currentUser.id).subscribe({
            next: () => {
              this.toastService.success('Request approved successfully');
              this.loadRequests();
            },
            error: () => {
              this.toastService.error('Failed to approve request');
            }
          });
        }
      }
    });
  }

  rejectRequest(request: AssetRequest) {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.requestService.rejectRequest(request.id, currentUser.id, reason).subscribe({
          next: () => {
            this.toastService.success('Request rejected');
            this.loadRequests();
          },
          error: () => {
            this.toastService.error('Failed to reject request');
          }
        });
      }
    }
  }

  cancelRequest(request: AssetRequest) {
    this.confirmDialog.confirm(
      'Cancel Request',
      `Are you sure you want to cancel the request for "${request.assetName}"?`
    ).subscribe(confirmed => {
      if (confirmed) {
        this.requestService.updateRequestStatus(request.id, 'CANCELLED').subscribe({
          next: () => {
            this.toastService.success('Request cancelled');
            this.loadRequests();
          },
          error: () => {
            this.toastService.error('Failed to cancel request');
          }
        });
      }
    });
  }

  onRequestClick = (request: AssetRequest) => {
    this.viewRequest(request.id);
  }
  
  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}