import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AssetService } from '../../core/services/asset.service';
import { RoleService } from '../../core/services/role.service';
import { AllocationService } from '../../core/services/allocation.service';
import { Asset, AssetAllocation, User } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { UserSelectorDialogComponent } from '../../shared/components/user-selector-dialog/user-selector-dialog.component';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-assets-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, UserSelectorDialogComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Assets Management</h1>
          <p class="page-description">Manage your organization's assets</p>
        </div>
        <div class="header-actions">
          <button *ngIf="roleService.canManageAssets()" 
                  class="btn btn-primary" 
                  (click)="createAsset()">
            Add Asset
          </button>
        </div>
      </div>

      <!-- Assets Section -->
      <div class="assets-section">
        <!-- Filters and Controls -->
        <div class="filters-section">
          <div class="filters">
            <select class="form-select" [(ngModel)]="filters.category" (change)="applyFilters()">
              <option value="">All Categories</option>
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="ACCESSORIES">Accessories</option>
            </select>
            
            <select class="form-select" [(ngModel)]="filters.type" (change)="applyFilters()">
              <option value="">All Types</option>
              <option value="LAPTOP">Laptop</option>
              <option value="DESKTOP">Desktop</option>
              <option value="MONITOR">Monitor</option>
              <option value="PRINTER">Printer</option>
              <option value="LICENSE">License</option>
              <option value="ACCESSORIES">Accessories</option>
            </select>
          </div>
          
          <div class="view-toggle">
            <button class="btn btn-sm" 
                    [class.active]="showGrouped" 
                    (click)="setView(true)">
              Groups
            </button>
            <button class="btn btn-sm" 
                    [class.active]="!showGrouped" 
                    (click)="setView(false)">
              List
            </button>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div class="bulk-actions" *ngIf="selectedAssets.size > 0 && roleService.canManageAssets()">
          <span class="selected-count">{{ selectedAssets.size }} selected</span>
          <button class="btn btn-sm btn-primary" (click)="bulkAllocate()">
            Allocate Selected
          </button>
          <button class="btn btn-sm btn-secondary" (click)="bulkReturn()">
            Return Selected
          </button>
          <button class="btn btn-sm btn-info" (click)="viewAllocationHistory()">
            View Allocation History
          </button>
          <button class="btn btn-sm btn-warning" (click)="bulkUpdateStatus('MAINTENANCE')">
            Mark Maintenance
          </button>
          <button class="btn btn-sm btn-danger" (click)="bulkDelete()">
            Delete Selected
          </button>
        </div>

        <!-- Grouped View -->
        <div *ngIf="showGrouped" class="grouped-view">
        <div class="asset-groups-grid">
          <div *ngFor="let group of filteredGroups" class="asset-group-card card card-hover clickable" (click)="viewGroupDetails(group)">
            <div class="card-body">
              <div class="group-header">
                <div class="group-info">
                  <h3 class="group-name">{{ group.name }}</h3>
                  <span class="badge badge-info">{{ getGroupCategory(group) }}</span>
                </div>
                <div class="group-total">
                  <span class="total-count">{{ group.total }}</span>
                  <span class="total-label">Total</span>
                </div>
              </div>

              <div class="status-breakdown">
                <div class="status-item" (click)="viewGroupByStatus(group, 'AVAILABLE')" style="cursor: pointer;">
                  <div class="status-count available">{{ group.available }}</div>
                  <div class="status-label">Available</div>
                </div>
                <div class="status-item" (click)="viewGroupByStatus(group, 'ALLOCATED')" style="cursor: pointer;">
                  <div class="status-count allocated">{{ group.allocated }}</div>
                  <div class="status-label">Allocated</div>
                </div>
                <div class="status-item" (click)="viewGroupByStatus(group, 'MAINTENANCE')" style="cursor: pointer;">
                  <div class="status-count maintenance">{{ group.maintenance }}</div>
                  <div class="status-label">Maintenance</div>
                </div>
                <div class="status-item" *ngIf="group.retired > 0" (click)="viewGroupByStatus(group, 'RETIRED')" style="cursor: pointer;">
                  <div class="status-count retired">{{ group.retired }}</div>
                  <div class="status-label">Retired</div>
                </div>
              </div>


            </div>
          </div>
        </div>

        <div *ngIf="filteredGroups.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No asset groups found</h3>
          <p>No assets match your current filters.</p>
        </div>

        <!-- List View -->
        <div *ngIf="!showGrouped" class="list-view">
        <div class="table-controls" *ngIf="roleService.canManageAssets()">
          <label class="select-all">
            <input type="checkbox" 
                   [checked]="isAllSelected()" 
                   [indeterminate]="isSomeSelected()"
                   (change)="toggleSelectAll($event)">
            Select All
          </label>
          <div class="table-actions">
            <button class="btn btn-outline btn-sm" (click)="refreshAssets()">
              🔄 Refresh
            </button>

          </div>
        </div>
        
        <app-data-table
          [data]="assets"
          [columns]="getVisibleColumns()"
          [actions]="actions"
          [pagination]="pagination"
          [selectable]="roleService.canManageAssets()"
          [selectedItems]="selectedAssets"
          (pageChange)="onPageChange($event)"
          (selectionChange)="onSelectionChange($event)">
        </app-data-table>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading assets...</p>
      </div>

      <!-- User Selector Dialog -->
      <div *ngIf="showUserSelector">
        <app-user-selector-dialog></app-user-selector-dialog>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }



    .assets-section {
      background: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
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
      align-items: center;
    }
    
    .advanced-filters {
      margin-bottom: var(--space-6);
      padding: var(--space-4);
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
    }
    
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
      align-items: end;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    
    .filter-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700);
    }
    
    .filter-actions {
      display: flex;
      gap: var(--space-2);
      justify-content: flex-end;
    }
    
    .bulk-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2-5);
      background: var(--primary-50);
      border-bottom: 1px solid var(--gray-200);
      flex-wrap: wrap;
    }
    
    .selected-count {
      font-weight: 600;
      color: var(--primary-700);
    }
    
    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
      padding: var(--space-2-5);
      background: var(--gray-50);
      border-radius: var(--radius-md);
    }
    
    .select-all {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 500;
      cursor: pointer;
    }
    
    .table-actions {
      display: flex;
      gap: var(--space-2);
    }

    .form-select, .form-control {
      min-width: 140px;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      background: white;
      transition: border-color 0.2s;
    }
    
    .form-select:focus, .form-control:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .view-toggle {
      display: flex;
      gap: var(--space-1);
      background: var(--gray-100);
      border-radius: var(--radius-md);
      padding: var(--space-1);
    }

    .view-toggle .btn {
      padding: var(--space-2) var(--space-3);
      border: none;
      background: transparent;
      color: var(--gray-600);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }

    .view-toggle .btn.active {
      background: var(--primary-500);
      color: white;
    }

    .grouped-view {
      padding: var(--space-4);
    }

    .asset-groups-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-6);
    }

    .asset-group-card {
      transition: all var(--transition-fast);
    }

    .asset-group-card.clickable {
      cursor: pointer;
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-3);
    }

    .group-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 var(--space-1) 0;
    }

    .group-total {
      text-align: center;
    }

    .total-count {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-600);
      line-height: 1;
    }

    .total-label {
      font-size: 0.75rem;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-breakdown {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
      gap: var(--space-2-5);
      margin-bottom: var(--space-3);
      padding: var(--space-3);
      background-color: var(--gray-50);
      border-radius: var(--radius-md);
    }

    .status-item {
      text-align: center;
    }

    .status-count {
      display: block;
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1;
      margin-bottom: var(--space-1);
    }

    .status-count.available { color: var(--success-600); }
    .status-count.allocated { color: var(--primary-600); }
    .status-count.maintenance { color: var(--warning-600); }
    .status-count.retired { color: var(--gray-500); }

    .status-label {
      font-size: 0.75rem;
      color: var(--gray-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    


    .group-actions {
      display: flex;
      gap: var(--space-2);
      justify-content: flex-end;
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

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: var(--space-4);
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
      
      .form-select {
        min-width: auto;
        width: 100%;
      }
      
      .view-toggle {
        width: 100%;
      }
      
      .bulk-actions {
        justify-content: center;
        flex-direction: column;
        gap: var(--space-2);
      }

      .asset-groups-grid {
        grid-template-columns: 1fr;
      }
      
      .group-header {
        flex-direction: column;
        gap: var(--space-3);
      }
    }
  `]
})
export class AssetsPageComponent implements OnInit {
  showGrouped = true;
  loading = true;
  
  // Data
  assetGroups: any[] = [];
  filteredGroups: any[] = [];
  assets: Asset[] = [];
  pagination: any = null;
  selectedAssets: Set<number> = new Set();
  allocationAnalytics: any = null;
  
  // Filters
  filters = {
    category: '',
    type: ''
  };
  
  searchTimeout: any;
  

  
  // Dialog state
  showUserSelector = false;
  userSelectorData: any = null;
  
  // Table configuration
  columns: TableColumn[] = [
    { key: 'assetTag', label: 'Asset Tag', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type' },
    { key: 'model', label: 'Model' },
    { key: 'status', label: 'Status' },
    { key: 'cost', label: 'Cost', pipe: 'currency' },
    { key: 'purchaseDate', label: 'Purchase Date', pipe: 'date' },
    { key: 'warrantyExpiryDate', label: 'Warranty Expiry', pipe: 'date' },
    { key: 'allocatedTo', label: 'Allocated To', render: (asset: Asset) => asset.allocatedTo?.name || 'N/A' },
    { key: 'allocationDuration', label: 'Allocation Duration', render: (asset: Asset) => this.getAllocationDuration(asset) }
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
    },
    { 
      label: 'Request Return', 
      icon: '📤', 
      action: (asset) => this.requestReturn(asset), 
      condition: (asset) => asset.status === 'ALLOCATED' && this.roleService.canManageAssets() 
    },
    { 
      label: 'History', 
      icon: '📋', 
      action: (asset) => this.viewAssetAllocationHistory(asset.id), 
      condition: () => this.roleService.canManageAssets() 
    }
  ];

  constructor(
    private assetService: AssetService,
    private allocationService: AllocationService,
    private router: Router,
    public roleService: RoleService,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.loadData();
    this.loadAllocationAnalytics();
  }

  loadData() {
    this.loading = true;
    
    if (this.showGrouped) {
      this.loadAssetGroups();
    } else {
      this.loadAssets();
    }
  }

  loadAssetGroups() {
    this.loading = true;
    this.assetService.getAssetGroups().subscribe({
      next: (groups) => {
        this.assetGroups = groups || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load asset groups:', error);
        this.assetGroups = [];
        this.filteredGroups = [];
        this.toastService.error('Failed to load asset groups. Using offline data.');
        this.loading = false;
      }
    });
  }

  loadAssets(page: number = 0) {
    this.loading = true;
    const hasFilters = this.hasActiveFilters();
    
    this.assetService.getAssets(page, 10).subscribe({
      next: (response) => {
        let assets = response?.content || [];
        
        // Apply filters
        if (this.filters.category) {
          assets = assets.filter(asset => asset.category === this.filters.category);
        }
        if (this.filters.type) {
          assets = assets.filter(asset => asset.type === this.filters.type);
        }
        
        this.assets = assets;
        this.pagination = {
          page: response?.number || 0,
          totalPages: response?.totalPages || 0,
          totalElements: response?.totalElements || 0
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load assets:', error);
        this.assets = [];
        this.pagination = { page: 0, totalPages: 0, totalElements: 0 };
        this.toastService.error('Failed to load assets');
        this.loading = false;
      }
    });
  }

  applyFilters() {
    if (this.showGrouped) {
      this.filteredGroups = this.assetGroups.filter(group => {
        if (this.filters.category && group.category !== this.filters.category) {
          return false;
        }
        if (this.filters.type && group.name.toLowerCase().includes(this.filters.type.toLowerCase())) {
          return true;
        }
        if (!this.filters.type) {
          return true;
        }
        return false;
      });
    } else {
      this.loadAssets(0);
    }
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      if (this.showGrouped) {
        this.applyFilters();
      } else {
        this.loadAssets(0);
      }
    }, 300);
  }

  toggleView() {
    this.showGrouped = !this.showGrouped;
    this.loadData();
  }

  setView(grouped: boolean) {
    if (this.showGrouped !== grouped) {
      this.showGrouped = grouped;
      this.loadData();
    }
  }

  onPageChange(page: number) {
    this.loadAssets(page);
  }

  // Navigation methods
  createAsset() {
    this.router.navigate(['/assets/new']);
  }

  viewAsset(id: number) {
    this.router.navigate(['/assets', id]);
  }

  editAsset(id: number) {
    this.router.navigate(['/assets', id, 'edit']);
  }

  viewGroupDetails(group: any) {
    this.router.navigate(['/assets/group', encodeURIComponent(group.name)]);
  }



  allocateAsset(asset: Asset) {
    if (asset.type === 'LICENSE') {
      this.showUserSelectorDialog([asset]);
    } else {
      this.showSingleUserSelector(asset);
    }
  }
  
  showSingleUserSelector(asset: Asset) {
    const userIdStr = prompt(`Enter user ID to allocate ${asset.name}:`);
    if (!userIdStr) return;
    
    const userId = Number(userIdStr);
    if (isNaN(userId)) {
      this.toastService.error('Invalid user ID');
      return;
    }
    
    this.assetService.allocateAsset(asset.id, userId).subscribe({
      next: () => {
        this.toastService.success('Asset allocated successfully');
        this.loadData();
      },
      error: () => this.toastService.error('Failed to allocate asset')
    });
  }

  returnAsset(asset: Asset) {
    const remarks = prompt(`Enter return remarks for ${asset.name} (optional):`);
    
    this.assetService.returnAsset(asset.id, remarks || undefined).subscribe({
      next: () => {
        this.toastService.success('Asset returned successfully');
        this.loadData();
      },
      error: () => this.toastService.error('Failed to return asset')
    });
  }
  
  requestReturn(asset: Asset) {
    const remarks = prompt(`Enter reason for return request for ${asset.name}:`);
    if (!remarks) return;
    
    this.allocationService.requestReturn(asset.id, remarks).subscribe({
      next: () => {
        this.toastService.success('Return request sent to user');
        this.loadData();
      },
      error: () => this.toastService.error('Failed to send return request')
    });
  }


  
  // New methods for enhanced functionality

  
  hasActiveFilters(): boolean {
    return !!(this.filters.category || this.filters.type);
  }
  
  clearAllFilters() {
    this.filters = {
      category: '',
      type: ''
    };
    this.applyFilters();
  }
  
  applyClientSideFilters(assets: Asset[]): Asset[] {
    return assets;
  }
  
  // Selection methods
  isAllSelected(): boolean {
    return this.assets.length > 0 && this.selectedAssets.size === this.assets.length;
  }
  
  isSomeSelected(): boolean {
    return this.selectedAssets.size > 0 && this.selectedAssets.size < this.assets.length;
  }
  
  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.assets.forEach(asset => this.selectedAssets.add(asset.id));
    } else {
      this.selectedAssets.clear();
    }
  }
  
  onSelectionChange(selectedIds: Set<number>) {
    this.selectedAssets = selectedIds;
  }
  
  // Bulk operations
  bulkAllocate() {
    if (this.selectedAssets.size === 0) return;
    
    const availableAssets = this.assets.filter(asset => 
      this.selectedAssets.has(asset.id) && asset.status === 'AVAILABLE'
    );
    
    if (availableAssets.length === 0) {
      this.toastService.error('No available assets selected');
      return;
    }
    
    // Check if all selected assets are software licenses
    const licenseAssets = availableAssets.filter(asset => asset.type === 'LICENSE');
    const hardwareAssets = availableAssets.filter(asset => asset.type !== 'LICENSE');
    
    if (hardwareAssets.length > 0) {
      this.toastService.error(`Cannot bulk allocate hardware assets (${hardwareAssets.length} selected). Hardware requires individual allocation for setup and configuration. Only software licenses can be bulk allocated.`);
      return;
    }
    
    if (licenseAssets.length === 0) {
      this.toastService.error('No software licenses selected for bulk allocation');
      return;
    }
    
    const userIdStr = prompt(`Enter user ID to allocate ${licenseAssets.length} software licenses:`);
    if (!userIdStr) return;
    
    const userId = Number(userIdStr);
    if (isNaN(userId)) {
      this.toastService.error('Invalid user ID');
      return;
    }
    
    // Check license availability
    const unavailableLicenses = licenseAssets.filter(asset => {
      const available = (asset.totalLicenses || 0) - (asset.usedLicenses || 0);
      return available <= 0;
    });
    
    if (unavailableLicenses.length > 0) {
      this.toastService.error(`Some licenses have no available seats: ${unavailableLicenses.map(l => l.name).join(', ')}`);
      return;
    }
    
    // Show user selector dialog
    this.showUserSelectorDialog(licenseAssets);
  }
  
  bulkUpdateStatus(status: string) {
    if (this.selectedAssets.size === 0) return;
    
    this.confirmDialog.confirm(
      'Update Status',
      `Are you sure you want to update ${this.selectedAssets.size} assets to ${status}?`
    ).subscribe(confirmed => {
      if (confirmed) {
        // Implement bulk status update
        this.toastService.success(`${this.selectedAssets.size} assets updated to ${status}`);
        this.selectedAssets.clear();
        this.loadAssets();
      }
    });
  }
  
  bulkDelete() {
    if (this.selectedAssets.size === 0) return;
    
    this.confirmDialog.confirm(
      'Delete Assets',
      `Are you sure you want to delete ${this.selectedAssets.size} assets? This action cannot be undone.`
    ).subscribe(confirmed => {
      if (confirmed) {
        // Implement bulk delete
        this.toastService.success(`${this.selectedAssets.size} assets deleted`);
        this.selectedAssets.clear();
        this.loadAssets();
      }
    });
  }
  
  refreshAssets() {
    this.selectedAssets.clear();
    this.loadAssets();
  }
  

  
  getVisibleColumns(): TableColumn[] {
    return this.columns; // For now, return all columns
  }
  

  
  // New allocation-specific methods
  loadAllocationAnalytics() {
    this.assetService.getAllocationAnalytics().subscribe({
      next: (analytics) => {
        this.allocationAnalytics = analytics;
      },
      error: (error) => {
        console.error('Failed to load allocation analytics:', error);
        // Fallback to allocation service
        this.allocationService.getAnalytics().subscribe({
          next: (analytics) => {
            this.allocationAnalytics = analytics;
          },
          error: () => {
            console.error('Failed to load allocation analytics from fallback');
          }
        });
      }
    });
  }
  
  getAllocationDuration(asset: Asset): string {
    if (asset.status !== 'ALLOCATED' || !asset.allocatedDate) {
      return 'N/A';
    }
    const allocated = new Date(asset.allocatedDate);
    const now = new Date();
    const days = Math.floor((now.getTime() - allocated.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days`;
  }
  
  viewAssetAllocationHistory(assetId: number) {
    this.router.navigate(['/assets', assetId, 'allocations']);
  }
  
  viewAllocationHistory() {
    if (this.selectedAssets.size === 1) {
      const assetId = Array.from(this.selectedAssets)[0];
      this.viewAssetAllocationHistory(assetId);
    } else {
      this.toastService.info('Please select a single asset to view allocation history');
    }
  }
  
  viewGroupAllocationHistory(group: any) {
    this.toastService.info(`Viewing allocation history for ${group.name} group`);
  }
  
  viewGroupByStatus(group: any, status: string) {
    this.router.navigate(['/assets/group', encodeURIComponent(group.name)], {
      queryParams: { status: status }
    });
  }
  
  bulkReturn() {
    if (this.selectedAssets.size === 0) return;
    
    const allocatedAssets = this.assets.filter(asset => 
      this.selectedAssets.has(asset.id) && asset.status === 'ALLOCATED'
    );
    
    if (allocatedAssets.length === 0) {
      this.toastService.error('No allocated assets selected');
      return;
    }
    
    const remarks = prompt(`Enter return remarks for ${allocatedAssets.length} assets (optional):`);
    
    this.confirmDialog.confirm(
      'Return Assets',
      `Are you sure you want to return ${allocatedAssets.length} allocated assets?`
    ).subscribe(confirmed => {
      if (confirmed) {
        // Process bulk return using the new bulk API
        const assetIds = allocatedAssets.map(asset => asset.id);
        this.assetService.bulkReturnAssets(assetIds, remarks || undefined).subscribe({
          next: (result) => {
            this.toastService.success(`${result.success} assets returned successfully`);
            if (result.failures > 0) {
              this.toastService.error(`${result.failures} assets failed to return`);
            }
            this.selectedAssets.clear();
            this.loadAssets();
          },
          error: () => {
            this.toastService.error('Failed to return assets');
          }
        });
      }
    });
  }
  

  
  showUserSelectorDialog(licenseAssets: Asset[]) {
    // Simple user selection for now
    const userIdStr = prompt(`Enter user ID to allocate ${licenseAssets.length} licenses:`);
    if (!userIdStr) return;
    
    const userId = Number(userIdStr);
    if (isNaN(userId)) {
      this.toastService.error('Invalid user ID');
      return;
    }
    
    // Allocate to single user
    let completed = 0;
    licenseAssets.forEach(asset => {
      this.assetService.allocateAsset(asset.id, userId).subscribe({
        next: () => {
          completed++;
          if (completed === licenseAssets.length) {
            this.toastService.success(`${licenseAssets.length} licenses allocated successfully`);
            this.selectedAssets.clear();
            this.loadAssets();
          }
        },
        error: () => {
          this.toastService.error(`Failed to allocate ${asset.name}`);
        }
      });
    });
  }

  bulkAllocateGroup(group: any) {
    this.router.navigate(['/assets/allocate'], { 
      queryParams: { group: group.name }
    });
  }

  exportGroupData(group: any) {
    this.toastService.info(`Please use the Reports page to export ${group.name} group data`);
    this.router.navigate(['/reports']);
  }

  getGroupCategory(group: any): string {
    const name = group.name.toLowerCase();
    if (name.includes('laptop') || name.includes('dell') || name.includes('hp') || name.includes('lenovo')) return 'Hardware';
    if (name.includes('monitor') || name.includes('display')) return 'Display';
    if (name.includes('printer')) return 'Printer';
    if (name.includes('license') || name.includes('software') || name.includes('office') || name.includes('adobe')) return 'Software';
    if (name.includes('mouse') || name.includes('keyboard') || name.includes('cable')) return 'Accessories';
    return 'Equipment';
  }
  

}