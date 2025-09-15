import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AssetService } from '../../core/services/asset.service';
import { RoleService } from '../../core/services/role.service';
import { Asset } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-warranty-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Warranty Management</h1>
          <p class="page-description">Monitor and manage asset warranties</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="exportWarrantyReport()">
            📊 Export Report
          </button>
          <button class="btn btn-primary" (click)="refreshData()">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Warranty Statistics -->
      <div class="warranty-stats">
        <div class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <div class="stat-value">{{ warrantyStats?.total || 0 }}</div>
              <div class="stat-label">Total Assets</div>
            </div>
          </div>
          <div class="stat-card valid">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ warrantyStats?.valid || 0 }}</div>
              <div class="stat-label">Valid Warranties</div>
              <div class="stat-percentage">{{ getPercentage(warrantyStats?.valid, warrantyStats?.total) }}%</div>
            </div>
          </div>
          <div class="stat-card expiring">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <div class="stat-value">{{ warrantyStats?.expiringSoon || 0 }}</div>
              <div class="stat-label">Expiring Soon</div>
              <div class="stat-sublabel">(Next 30 days)</div>
            </div>
          </div>
          <div class="stat-card expired">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <div class="stat-value">{{ warrantyStats?.expired || 0 }}</div>
              <div class="stat-label">Expired</div>
              <div class="stat-percentage">{{ getPercentage(warrantyStats?.expired, warrantyStats?.total) }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Warranty Tabs -->
      <div class="warranty-tabs">
        <div class="tabs">
          <button class="tab" 
                  [class.active]="activeTab === 'expiring'" 
                  (click)="setActiveTab('expiring')">
            Expiring Soon ({{ expiringAssets.length }})
          </button>
          <button class="tab" 
                  [class.active]="activeTab === 'expired'" 
                  (click)="setActiveTab('expired')">
            Expired ({{ expiredAssets.length }})
          </button>
          <button class="tab" 
                  [class.active]="activeTab === 'valid'" 
                  (click)="setActiveTab('valid')">
            Valid ({{ validAssets.length }})
          </button>
          <button class="tab" 
                  [class.active]="activeTab === 'all'" 
                  (click)="setActiveTab('all')">
            All Assets
          </button>
        </div>

        <!-- Filters -->
        <div class="tab-filters">
          <select class="form-select" [(ngModel)]="categoryFilter" (change)="applyFilters()">
            <option value="">All Categories</option>
            <option value="HARDWARE">Hardware</option>
            <option value="SOFTWARE">Software</option>
            <option value="ACCESSORIES">Accessories</option>
          </select>
          
          <input type="text" 
                 class="form-control" 
                 placeholder="Search assets..." 
                 [(ngModel)]="searchTerm"
                 (input)="onSearchChange()">
        </div>
      </div>

      <!-- Assets Table -->
      <div class="warranty-content">
        <div *ngIf="activeTab === 'expiring'" class="tab-panel">
          <div class="alert alert-warning" *ngIf="expiringAssets.length > 0">
            <strong>⚠️ Attention Required:</strong> 
            {{ expiringAssets.length }} assets have warranties expiring within 30 days.
          </div>
          <app-data-table
            [data]="getFilteredAssets('expiring')"
            [columns]="getColumnsForTab('expiring')"
            [actions]="actions"
            [pagination]="expiringPagination"
            (pageChange)="onPageChange('expiring', $event)">
          </app-data-table>
        </div>

        <div *ngIf="activeTab === 'expired'" class="tab-panel">
          <div class="alert alert-danger" *ngIf="expiredAssets.length > 0">
            <strong>❌ Action Required:</strong> 
            {{ expiredAssets.length }} assets have expired warranties.
          </div>
          <app-data-table
            [data]="getFilteredAssets('expired')"
            [columns]="getColumnsForTab('expired')"
            [actions]="actions"
            [pagination]="expiredPagination"
            (pageChange)="onPageChange('expired', $event)">
          </app-data-table>
        </div>

        <div *ngIf="activeTab === 'valid'" class="tab-panel">
          <app-data-table
            [data]="getFilteredAssets('valid')"
            [columns]="getColumnsForTab('valid')"
            [actions]="actions"
            [pagination]="validPagination"
            (pageChange)="onPageChange('valid', $event)">
          </app-data-table>
        </div>

        <div *ngIf="activeTab === 'all'" class="tab-panel">
          <app-data-table
            [data]="getFilteredAssets('all')"
            [columns]="getColumnsForTab('all')"
            [actions]="actions"
            [pagination]="allPagination"
            (pageChange)="onPageChange('all', $event)">
          </app-data-table>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading warranty data...</p>
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
    
    .page-title {
      margin: 0 0 var(--space-2) 0;
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
    
    .warranty-stats {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      padding: var(--space-6);
      margin-bottom: var(--space-6);
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--space-4);
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-5);
      border-radius: var(--radius-lg);
      transition: transform var(--transition-fast);
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
    }
    
    .stat-card.total {
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
    }
    
    .stat-card.valid {
      background: var(--success-50);
      border: 1px solid var(--success-200);
    }
    
    .stat-card.expiring {
      background: var(--warning-50);
      border: 1px solid var(--warning-200);
    }
    
    .stat-card.expired {
      background: var(--error-50);
      border: 1px solid var(--error-200);
    }
    
    .stat-icon {
      font-size: 2.5rem;
    }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1;
      margin-bottom: var(--space-1);
    }
    
    .stat-label {
      color: var(--gray-700);
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    .stat-sublabel {
      color: var(--gray-500);
      font-size: 0.75rem;
      margin-top: var(--space-1);
    }
    
    .stat-percentage {
      color: var(--gray-600);
      font-size: 0.875rem;
      font-weight: 500;
      margin-top: var(--space-1);
    }
    
    .warranty-tabs {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
      margin-bottom: var(--space-6);
    }
    
    .tabs {
      display: flex;
      border-bottom: 1px solid var(--gray-200);
      background: var(--gray-50);
    }
    
    .tab {
      padding: var(--space-4) var(--space-6);
      border: none;
      background: none;
      cursor: pointer;
      font-weight: 500;
      color: var(--gray-600);
      border-bottom: 2px solid transparent;
      transition: all var(--transition-fast);
      font-size: 0.875rem;
      flex: 1;
      text-align: center;
    }
    
    .tab.active {
      color: var(--primary-600);
      border-bottom-color: var(--primary-600);
      background: white;
    }
    
    .tab:hover:not(.active) {
      color: var(--primary-500);
      background: var(--gray-100);
    }
    
    .tab-filters {
      display: flex;
      gap: var(--space-4);
      padding: var(--space-4);
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
    }
    
    .form-select, .form-control {
      min-width: 150px;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }
    
    .warranty-content {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }
    
    .tab-panel {
      animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .alert {
      padding: var(--space-4);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
      font-size: 0.875rem;
    }
    
    .alert-warning {
      background: var(--warning-50);
      color: var(--warning-800);
      border: 1px solid var(--warning-200);
    }
    
    .alert-danger {
      background: var(--error-50);
      color: var(--error-800);
      border: 1px solid var(--error-200);
    }
    
    .loading-state, .empty-state {
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
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .tabs {
        flex-direction: column;
      }
      
      .tab-filters {
        flex-direction: column;
      }
    }
  `]
})
export class WarrantyManagementComponent implements OnInit {
  loading = true;
  activeTab = 'expiring';
  
  // Data
  warrantyStats: any = null;
  expiringAssets: Asset[] = [];
  expiredAssets: Asset[] = [];
  validAssets: Asset[] = [];
  allAssets: Asset[] = [];
  
  // Pagination
  expiringPagination: any = null;
  expiredPagination: any = null;
  validPagination: any = null;
  allPagination: any = null;
  
  // Filters
  categoryFilter = '';
  searchTerm = '';
  searchTimeout: any;
  
  // Table configuration
  baseColumns: TableColumn[] = [
    { key: 'assetTag', label: 'Asset Tag', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type' },
    { key: 'purchaseDate', label: 'Purchase Date', pipe: 'date' },
    { key: 'warrantyExpiryDate', label: 'Warranty Expiry', pipe: 'date' }
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
      label: 'Extend Warranty', 
      icon: '🔄', 
      action: (asset) => this.extendWarranty(asset), 
      condition: () => this.roleService.canManageAssets() 
    }
  ];

  constructor(
    private assetService: AssetService,
    private router: Router,
    public roleService: RoleService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadWarrantyData();
  }

  loadWarrantyData() {
    this.loading = true;
    
    // Load warranty statistics
    if (this.roleService.canManageAssets()) {
      this.assetService.getWarrantyStats().subscribe({
        next: (stats) => {
          this.warrantyStats = stats;
        },
        error: () => {
          this.toastService.error('Failed to load warranty statistics');
        }
      });
    }
    
    // Load expiring warranties
    this.assetService.getWarrantyExpiring(30, 0, 50).subscribe({
      next: (response) => {
        this.expiringAssets = response.content || [];
        this.expiringPagination = {
          page: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        };
      },
      error: () => {
        this.toastService.error('Failed to load expiring warranties');
      }
    });
    
    // Load expired warranties
    if (this.roleService.canManageAssets()) {
      this.assetService.getExpiredWarranties(0, 50).subscribe({
        next: (response) => {
          this.expiredAssets = response.content || [];
          this.expiredPagination = {
            page: response.number || 0,
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0
          };
        },
        error: () => {
          this.toastService.error('Failed to load expired warranties');
        }
      });
    }
    
    // Load valid warranties
    if (this.roleService.canManageAssets()) {
      this.assetService.getValidWarranties(0, 50).subscribe({
        next: (response) => {
          this.validAssets = response.content || [];
          this.validPagination = {
            page: response.number || 0,
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0
          };
          this.loading = false;
        },
        error: () => {
          this.toastService.error('Failed to load valid warranties');
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'all' && this.allAssets.length === 0) {
      this.loadAllAssets();
    }
  }

  loadAllAssets() {
    this.assetService.getAssets(0, 100).subscribe({
      next: (response) => {
        this.allAssets = response.content || [];
        this.allPagination = {
          page: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        };
      },
      error: () => {
        this.toastService.error('Failed to load all assets');
      }
    });
  }

  getCurrentAssets(): Asset[] {
    switch (this.activeTab) {
      case 'expiring': return this.expiringAssets;
      case 'expired': return this.expiredAssets;
      case 'valid': return this.validAssets;
      case 'all': return this.allAssets;
      default: return [];
    }
  }

  getFilteredAssets(tab: string): Asset[] {
    let assets = this.getCurrentAssets();
    
    // Apply category filter
    if (this.categoryFilter) {
      assets = assets.filter(asset => asset.category === this.categoryFilter);
    }
    
    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      assets = assets.filter(asset => 
        asset.name.toLowerCase().includes(searchLower) ||
        asset.assetTag.toLowerCase().includes(searchLower) ||
        asset.model?.toLowerCase().includes(searchLower)
      );
    }
    
    return assets;
  }

  getColumnsForTab(tab: string): TableColumn[] {
    const columns = [...this.baseColumns];
    
    if (tab === 'expiring' || tab === 'expired') {
      // Add days remaining/overdue column
      columns.push({
        key: 'daysRemaining',
        label: tab === 'expiring' ? 'Days Remaining' : 'Days Overdue',
        render: (asset: Asset) => this.calculateDaysRemaining(asset.warrantyExpiryDate)
      });
    }
    
    if (tab === 'all') {
      // Add warranty status column
      columns.push({
        key: 'warrantyStatus',
        label: 'Warranty Status',
        render: (asset: Asset) => this.getWarrantyStatus(asset.warrantyExpiryDate)
      });
    }
    
    return columns;
  }

  calculateDaysRemaining(warrantyDate: string | null): string {
    if (!warrantyDate) return 'N/A';
    
    const expiry = new Date(warrantyDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} days`;
    } else if (diffDays === 0) {
      return 'Today';
    } else {
      return `${Math.abs(diffDays)} days ago`;
    }
  }

  getWarrantyStatus(warrantyDate: string | null): string {
    if (!warrantyDate) return 'No Warranty';
    
    const expiry = new Date(warrantyDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      return 'Valid';
    } else if (diffDays > 0) {
      return 'Expiring Soon';
    } else {
      return 'Expired';
    }
  }

  getPercentage(value: number | undefined, total: number | undefined): number {
    if (!value || !total || total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  applyFilters() {
    // Filters are applied in getFilteredAssets method
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      // Search is applied in getFilteredAssets method
    }, 300);
  }

  onPageChange(tab: string, page: number) {
    // Implement pagination for specific tab
    switch (tab) {
      case 'expiring':
        this.assetService.getWarrantyExpiring(30, page, 50).subscribe({
          next: (response) => {
            this.expiringAssets = response.content || [];
            this.expiringPagination.page = page;
          }
        });
        break;
      case 'expired':
        this.assetService.getExpiredWarranties(page, 50).subscribe({
          next: (response) => {
            this.expiredAssets = response.content || [];
            this.expiredPagination.page = page;
          }
        });
        break;
      case 'valid':
        this.assetService.getValidWarranties(page, 50).subscribe({
          next: (response) => {
            this.validAssets = response.content || [];
            this.validPagination.page = page;
          }
        });
        break;
      case 'all':
        this.assetService.getAssets(page, 100).subscribe({
          next: (response) => {
            this.allAssets = response.content || [];
            this.allPagination.page = page;
          }
        });
        break;
    }
  }

  refreshData() {
    this.loadWarrantyData();
    this.toastService.success('Warranty data refreshed');
  }

  exportWarrantyReport() {
    this.toastService.info('Exporting warranty report...');
    // Implement warranty report export
  }

  viewAsset(id: number) {
    this.router.navigate(['/assets', id]);
  }

  editAsset(id: number) {
    this.router.navigate(['/assets', id, 'edit']);
  }

  extendWarranty(asset: Asset) {
    const newDate = prompt('Enter new warranty expiry date (YYYY-MM-DD):', asset.warrantyExpiryDate || '');
    if (!newDate) return;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      this.toastService.error('Invalid date format. Please use YYYY-MM-DD');
      return;
    }
    
    // Update asset warranty
    const updateData = { ...asset, warrantyExpiryDate: newDate };
    this.assetService.updateAsset(asset.id, updateData).subscribe({
      next: () => {
        this.toastService.success('Warranty extended successfully');
        this.loadWarrantyData();
      },
      error: () => {
        this.toastService.error('Failed to extend warranty');
      }
    });
  }
}