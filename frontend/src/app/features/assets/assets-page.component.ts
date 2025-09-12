import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AssetService } from '../../core/services/asset.service';
import { RoleService } from '../../core/services/role.service';
import { Asset } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AssetAllocationDialogComponent } from '../../shared/components/asset-allocation-dialog/asset-allocation-dialog.component';

@Component({
  selector: 'app-assets-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, AssetAllocationDialogComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Assets Management</h1>
          <p class="page-description">Manage your organization's assets</p>
        </div>
        <div class="header-actions">
          <div class="export-buttons">
            <button class="btn btn-outline btn-sm" (click)="exportToCsv()" title="Export to CSV">
              📊 CSV
            </button>
            <button class="btn btn-outline btn-sm" (click)="exportToPdf()" title="Export to PDF">
              📄 PDF
            </button>
          </div>
          <button class="btn btn-outline" (click)="toggleView()">
            {{ showGrouped ? 'Individual View' : 'Grouped View' }}
          </button>
          <button *ngIf="roleService.canManageAssets()" 
                  class="btn btn-primary" 
                  (click)="createAsset()">
            Add Asset
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filters">
          <select class="form-select" [(ngModel)]="filters.category" (change)="applyFilters()">
            <option value="">All Categories</option>
            <option value="HARDWARE">Hardware</option>
            <option value="SOFTWARE">Software</option>
            <option value="ACCESSORIES">Accessories</option>
          </select>
          
          <select class="form-select" [(ngModel)]="filters.status" (change)="applyFilters()">
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
          
          <input type="text" 
                 class="form-control" 
                 placeholder="Search assets..." 
                 [(ngModel)]="filters.search"
                 (input)="onSearchChange()">
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

      <!-- Grouped View -->
      <div *ngIf="showGrouped" class="grouped-view">
        <div class="asset-groups-grid">
          <div *ngFor="let group of filteredGroups" class="asset-group-card card card-hover">
            <div class="card-body">
              <div class="group-header">
                <div class="group-info">
                  <h3 class="group-name">{{ group.name }}</h3>
                  <span class="badge badge-info">{{ group.category || 'Asset Group' }}</span>
                </div>
                <div class="group-total">
                  <span class="total-count">{{ group.total }}</span>
                  <span class="total-label">Total</span>
                </div>
              </div>

              <div class="status-breakdown">
                <div class="status-item">
                  <div class="status-count available">{{ group.available }}</div>
                  <div class="status-label">Available</div>
                </div>
                <div class="status-item">
                  <div class="status-count allocated">{{ group.allocated }}</div>
                  <div class="status-label">Allocated</div>
                </div>
                <div class="status-item">
                  <div class="status-count maintenance">{{ group.maintenance }}</div>
                  <div class="status-label">Maintenance</div>
                </div>
                <div class="status-item" *ngIf="group.retired > 0">
                  <div class="status-count retired">{{ group.retired }}</div>
                  <div class="status-label">Retired</div>
                </div>
              </div>

              <div class="group-actions">
                <button class="btn btn-outline btn-sm" (click)="viewGroupDetails(group)">
                  View Details
                </button>
                <button *ngIf="group.available > 0 && roleService.canManageAssets()" 
                        class="btn btn-primary btn-sm" 
                        (click)="allocateFromGroup(group)">
                  Allocate ({{ group.available }})
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredGroups.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No asset groups found</h3>
          <p>No assets match your current filters.</p>
        </div>
      </div>

      <!-- List View -->
      <div *ngIf="!showGrouped" class="list-view">
        <app-data-table
          [data]="assets"
          [columns]="columns"
          [actions]="actions"
          [pagination]="pagination"
          (pageChange)="onPageChange($event)">
        </app-data-table>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading assets...</p>
      </div>

      <!-- Allocation Dialog -->
      <app-asset-allocation-dialog
        *ngIf="dialogAsset"
        [asset]="dialogAsset"
        [mode]="dialogMode"
        [show]="showAllocationDialog"
        (close)="onDialogClose($event)">
      </app-asset-allocation-dialog>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }

    .export-buttons {
      display: flex;
      gap: var(--space-2);
    }

    .export-buttons .btn {
      font-size: 0.875rem;
      padding: var(--space-2) var(--space-3);
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

    .view-toggle {
      display: flex;
      gap: var(--space-1);
      background: white;
      border-radius: var(--radius-md);
      padding: var(--space-1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

    .asset-groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: var(--space-6);
    }

    .asset-group-card {
      transition: all var(--transition-fast);
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
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
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      padding: var(--space-4);
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
        gap: var(--space-4);
      }

      .filters {
        flex-direction: column;
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
  
  // Filters
  filters = {
    category: '',
    status: '',
    search: ''
  };
  
  searchTimeout: any;
  
  // Dialog state
  showAllocationDialog = false;
  dialogAsset: Asset | null = null;
  dialogMode: 'allocate' | 'return' = 'allocate';
  
  // Table configuration
  columns: TableColumn[] = [
    { key: 'assetTag', label: 'Asset Tag', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'cost', label: 'Cost', pipe: 'currency' }
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
    private assetService: AssetService,
    private router: Router,
    public roleService: RoleService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadData();
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
    const hasFilters = this.filters.category || this.filters.status || this.filters.search;
    
    if (hasFilters) {
      this.assetService.searchAssets({
        name: this.filters.search,
        category: this.filters.category,
        status: this.filters.status
      }, page, 10).subscribe({
        next: (response) => {
          this.assets = response?.content || [];
          this.pagination = {
            page: response?.number || 0,
            totalPages: response?.totalPages || 0,
            totalElements: response?.totalElements || 0
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to search assets:', error);
          this.assets = [];
          this.pagination = { page: 0, totalPages: 0, totalElements: 0 };
          this.toastService.error('Failed to search assets');
          this.loading = false;
        }
      });
    } else {
      this.assetService.getAssets(page, 10).subscribe({
        next: (response) => {
          this.assets = response?.content || [];
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
  }

  applyFilters() {
    this.filteredGroups = this.assetGroups.filter(group => {
      if (this.filters.category && group.category !== this.filters.category) {
        return false;
      }
      if (this.filters.search && !group.name.toLowerCase().includes(this.filters.search.toLowerCase())) {
        return false;
      }
      return true;
    });
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

  allocateFromGroup(group: any) {
    if (group.available <= 0) {
      this.toastService.error('No available assets in this group');
      return;
    }
    this.router.navigate(['/assets/allocate'], { 
      queryParams: { group: group.name }
    });
  }

  allocateAsset(asset: Asset) {
    this.dialogAsset = asset;
    this.dialogMode = 'allocate';
    this.showAllocationDialog = true;
  }

  returnAsset(asset: Asset) {
    this.dialogAsset = asset;
    this.dialogMode = 'return';
    this.showAllocationDialog = true;
  }

  onDialogClose(result: Asset | null) {
    this.showAllocationDialog = false;
    this.dialogAsset = null;
    if (result) {
      this.loadData();
    }
  }

  exportToCsv() {
    this.assetService.exportToCsv().subscribe({
      next: (blob) => {
        this.downloadFile(blob, 'assets.csv', 'text/csv');
        this.toastService.success('Assets exported to CSV successfully');
      },
      error: () => {
        this.toastService.error('Failed to export assets to CSV');
      }
    });
  }

  exportToPdf() {
    this.assetService.exportToPdf().subscribe({
      next: (blob) => {
        this.downloadFile(blob, 'assets.pdf', 'application/pdf');
        this.toastService.success('Assets exported to PDF successfully');
      },
      error: () => {
        this.toastService.error('Failed to export assets to PDF');
      }
    });
  }

  private downloadFile(blob: Blob, filename: string, mimeType: string) {
    const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}