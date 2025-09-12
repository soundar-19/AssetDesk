import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AssetService } from '../../core/services/asset.service';
import { RoleService } from '../../core/services/role.service';
import { Asset } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AssetAllocationDialogComponent } from '../../shared/components/asset-allocation-dialog/asset-allocation-dialog.component';

@Component({
  selector: 'app-assets-by-group',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, AssetAllocationDialogComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <button class="back-btn" (click)="goBack()">
            ← Back to Assets
          </button>
          <div class="title-section">
            <h1 class="page-title">{{ groupName }}</h1>
            <p class="page-description">Assets in this group</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="exportGroup()">
            📊 Export Group
          </button>
          <button *ngIf="roleService.canManageAssets()" 
                  class="btn btn-success" 
                  (click)="addAssetToGroup()">
            + Add Asset
          </button>
        </div>
      </div>

      <!-- Group Summary -->
      <div class="group-summary" *ngIf="groupSummary">
        <div class="summary-cards">
          <div class="summary-card total">
            <div class="card-icon">📦</div>
            <div class="card-content">
              <div class="card-value">{{ groupSummary.total }}</div>
              <div class="card-label">Total Assets</div>
            </div>
          </div>
          <div class="summary-card available">
            <div class="card-icon">✅</div>
            <div class="card-content">
              <div class="card-value">{{ groupSummary.available }}</div>
              <div class="card-label">Available</div>
            </div>
          </div>
          <div class="summary-card allocated">
            <div class="card-icon">👤</div>
            <div class="card-content">
              <div class="card-value">{{ groupSummary.allocated }}</div>
              <div class="card-label">Allocated</div>
            </div>
          </div>
          <div class="summary-card maintenance">
            <div class="card-icon">🔧</div>
            <div class="card-content">
              <div class="card-value">{{ groupSummary.maintenance }}</div>
              <div class="card-label">Maintenance</div>
            </div>
          </div>
          <div class="summary-card retired" *ngIf="groupSummary.retired > 0">
            <div class="card-icon">🗄️</div>
            <div class="card-content">
              <div class="card-value">{{ groupSummary.retired }}</div>
              <div class="card-label">Retired</div>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions" *ngIf="roleService.canManageAssets()">
          <button class="btn btn-primary" 
                  (click)="quickAllocate()" 
                  [disabled]="groupSummary.available === 0">
            Quick Allocate ({{ groupSummary.available }} available)
          </button>
          <button class="btn btn-outline" (click)="bulkUpdateStatus()">
            Bulk Update Status
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filters">
          <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
          
          <input type="text" 
                 class="form-control" 
                 placeholder="Search by asset tag or serial..." 
                 [(ngModel)]="searchTerm"
                 (input)="onSearchChange()">
        </div>
        
        <div class="view-options">
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="showOnlyAvailable" (change)="applyFilters()">
            Show only available
          </label>
        </div>
      </div>

      <!-- Assets Table -->
      <div class="assets-table" *ngIf="!loading">
        <app-data-table
          [data]="filteredAssets"
          [columns]="columns"
          [actions]="actions"
          [pagination]="pagination"
          (pageChange)="onPageChange($event)">
        </app-data-table>
      </div>

      <!-- Allocated Users Section -->
      <div class="allocated-users-section" *ngIf="groupSummary?.allocatedUsers?.length">
        <h3>Currently Allocated Users</h3>
        <div class="users-grid">
          <div *ngFor="let user of groupSummary.allocatedUsers" class="user-card">
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-details">
                <span class="user-email">{{ user.email }}</span>
                <span class="user-dept">{{ user.department }}</span>
              </div>
            </div>
            <div class="user-assets">
              <span class="asset-count">{{ getUserAssetCount(user.id) }} assets</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredAssets.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No assets found</h3>
        <p *ngIf="hasActiveFilters()">No assets match your current filters.</p>
        <p *ngIf="!hasActiveFilters()">This group doesn't have any assets yet.</p>
        <button *ngIf="roleService.canManageAssets() && !hasActiveFilters()" 
                class="btn btn-primary" 
                (click)="addAssetToGroup()">
          Add First Asset
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading group assets...</p>
      </div>


    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
      padding: var(--space-6);
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }
    
    .header-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    
    .back-btn {
      background: none;
      border: none;
      color: var(--primary-600);
      font-weight: 500;
      cursor: pointer;
      padding: var(--space-2) 0;
      transition: color var(--transition-fast);
      align-self: flex-start;
    }
    
    .back-btn:hover {
      color: var(--primary-700);
    }
    
    .page-title {
      margin: 0;
      color: var(--gray-900);
      font-size: 1.875rem;
      font-weight: 700;
    }
    
    .page-description {
      margin: 0;
      color: var(--gray-600);
      font-size: 1rem;
    }
    
    .header-actions {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }
    
    .group-summary {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      padding: var(--space-6);
      margin-bottom: var(--space-6);
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }
    
    .summary-card {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      border-radius: var(--radius-md);
      transition: transform var(--transition-fast);
    }
    
    .summary-card:hover {
      transform: translateY(-2px);
    }
    
    .summary-card.total {
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
    }
    
    .summary-card.available {
      background: var(--success-50);
      border: 1px solid var(--success-200);
    }
    
    .summary-card.allocated {
      background: var(--primary-50);
      border: 1px solid var(--primary-200);
    }
    
    .summary-card.maintenance {
      background: var(--warning-50);
      border: 1px solid var(--warning-200);
    }
    
    .summary-card.retired {
      background: var(--gray-100);
      border: 1px solid var(--gray-300);
    }
    
    .card-icon {
      font-size: 2rem;
    }
    
    .card-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1;
    }
    
    .card-label {
      color: var(--gray-600);
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    .quick-actions {
      display: flex;
      gap: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--gray-200);
    }
    
    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
      padding: var(--space-4);
      background: var(--gray-50);
      border-radius: var(--radius-lg);
    }
    
    .filters {
      display: flex;
      gap: var(--space-4);
      flex: 1;
    }
    
    .form-select, .form-control {
      min-width: 150px;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }
    
    .view-options {
      display: flex;
      gap: var(--space-4);
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700);
      cursor: pointer;
    }
    
    .assets-table {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }
    
    .allocated-users-section {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      padding: var(--space-6);
      margin-top: var(--space-6);
    }
    
    .allocated-users-section h3 {
      margin: 0 0 var(--space-4) 0;
      color: var(--gray-900);
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-4);
    }
    
    .user-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      background: var(--gray-50);
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
    }
    
    .user-name {
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: var(--space-1);
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
    
    .user-email {
      color: var(--primary-600);
      font-size: 0.875rem;
    }
    
    .user-dept {
      color: var(--gray-600);
      font-size: 0.875rem;
    }
    
    .asset-count {
      background: var(--primary-100);
      color: var(--primary-700);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
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
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: var(--primary-600);
      color: white;
      border-color: var(--primary-600);
    }
    
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-700);
      border-color: var(--primary-700);
    }
    
    .btn-success {
      background: var(--success-600);
      color: white;
      border-color: var(--success-600);
    }
    
    .btn-success:hover:not(:disabled) {
      background: var(--success-700);
      border-color: var(--success-700);
    }
    
    .btn-outline {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
    }
    
    .btn-outline:hover:not(:disabled) {
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
        gap: var(--space-4);
      }
      
      .filters {
        flex-direction: column;
      }
      
      .summary-cards {
        grid-template-columns: 1fr;
      }
      
      .quick-actions {
        flex-direction: column;
      }
      
      .users-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AssetsByGroupComponent implements OnInit {
  groupName = '';
  groupSummary: any = null;
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  pagination: any = null;
  loading = true;
  
  // Filters
  statusFilter = '';
  searchTerm = '';
  showOnlyAvailable = false;
  searchTimeout: any;
  
  // Dialog state

  
  // Table configuration
  columns: TableColumn[] = [
    { key: 'assetTag', label: 'Asset Tag', sortable: true },
    { key: 'serialNumber', label: 'Serial Number' },
    { key: 'status', label: 'Status' },
    { key: 'purchaseDate', label: 'Purchase Date', pipe: 'date' },
    { key: 'warrantyExpiryDate', label: 'Warranty Expiry', pipe: 'date' },
    { key: 'allocatedTo', label: 'Allocated To', render: (asset: Asset) => asset.allocatedTo?.name || 'N/A' }
  ];

  actions: TableAction[] = [
    { 
      label: 'View', 
      icon: '👁', 
      action: (asset) => this.viewAsset(asset.id) 
    },
    { 
      label: 'Edit', 
      icon: '✏', 
      action: (asset) => this.editAsset(asset.id), 
      condition: () => this.roleService.canManageAssets() 
    },
    { 
      label: 'Allocate', 
      icon: '👤', 
      action: (asset) => this.allocateAsset(asset), 
      condition: (asset) => asset.status === 'AVAILABLE' && this.roleService.canManageAssets() 
    },
    { 
      label: 'Return', 
      icon: '↩', 
      action: (asset) => this.returnAsset(asset), 
      condition: (asset) => asset.status === 'ALLOCATED' && this.roleService.canManageAssets() 
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assetService: AssetService,
    public roleService: RoleService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.groupName = decodeURIComponent(this.route.snapshot.paramMap.get('name') || '');
    if (this.groupName) {
      this.loadGroupData();
    } else {
      this.toastService.error('Invalid group name');
      this.router.navigate(['/assets']);
    }
  }

  loadGroupData() {
    this.loading = true;
    
    // Load group summary
    this.assetService.getGroupSummary(this.groupName).subscribe({
      next: (summary) => {
        this.groupSummary = summary;
      },
      error: () => {
        this.toastService.error('Failed to load group summary');
      }
    });
    
    // Load assets by name (group)
    this.assetService.getAssetsByName(this.groupName, 0, 100).subscribe({
      next: (response) => {
        this.assets = response.content || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load group assets');
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredAssets = this.assets.filter(asset => {
      // Status filter
      if (this.statusFilter && asset.status !== this.statusFilter) {
        return false;
      }
      
      // Show only available filter
      if (this.showOnlyAvailable && asset.status !== 'AVAILABLE') {
        return false;
      }
      
      // Search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesTag = asset.assetTag.toLowerCase().includes(searchLower);
        const matchesSerial = asset.serialNumber?.toLowerCase().includes(searchLower);
        if (!matchesTag && !matchesSerial) {
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
    return !!(this.statusFilter || this.searchTerm || this.showOnlyAvailable);
  }

  onPageChange(page: number) {
    // For now, we load all assets at once
    // In a real implementation, you might want to implement server-side pagination
  }

  goBack() {
    this.router.navigate(['/assets']);
  }

  addAssetToGroup() {
    // Navigate to asset form with pre-filled group name
    this.router.navigate(['/assets/new'], { 
      queryParams: { group: this.groupName }
    });
  }

  exportGroup() {
    this.toastService.info('Exporting group assets...');
    // Implement group-specific export
  }

  quickAllocate() {
    const userIdStr = prompt('Enter user ID to allocate an available asset:');
    if (!userIdStr) return;
    
    const userId = Number(userIdStr);
    if (isNaN(userId)) {
      this.toastService.error('Invalid user ID');
      return;
    }
    
    const remarks = `Quick allocated from group ${this.groupName}`;
    this.assetService.allocateFromGroup(this.groupName, userId, remarks).subscribe({
      next: () => {
        this.toastService.success('Asset allocated successfully');
        this.loadGroupData();
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to allocate asset');
      }
    });
  }

  bulkUpdateStatus() {
    this.toastService.info('Bulk update feature coming soon');
  }

  getUserAssetCount(userId: number): number {
    return this.assets.filter(asset => 
      asset.status === 'ALLOCATED' && asset.allocatedTo?.id === userId
    ).length;
  }

  // Asset actions
  viewAsset(id: number) {
    this.router.navigate(['/assets', id]);
  }

  editAsset(id: number) {
    this.router.navigate(['/assets', id, 'edit']);
  }

  allocateAsset(asset: Asset) {
    const userIdStr = prompt('Enter user ID to allocate this asset:');
    if (!userIdStr) return;
    
    const userId = Number(userIdStr);
    if (isNaN(userId)) {
      this.toastService.error('Invalid user ID');
      return;
    }
    
    this.assetService.allocateAsset(asset.id, userId).subscribe({
      next: () => {
        this.toastService.success('Asset allocated successfully');
        this.loadGroupData();
      },
      error: () => this.toastService.error('Failed to allocate asset')
    });
  }

  returnAsset(asset: Asset) {
    this.assetService.returnAsset(asset.id).subscribe({
      next: () => {
        this.toastService.success('Asset returned successfully');
        this.loadGroupData();
      },
      error: () => this.toastService.error('Failed to return asset')
    });
  }
}