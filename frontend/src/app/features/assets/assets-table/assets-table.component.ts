import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssetService } from '../../../core/services/asset.service';
import { RoleService } from '../../../core/services/role.service';
import { Asset } from '../../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchFilterComponent, FilterOption, SearchFilters } from '../../../shared/components/search-filter/search-filter.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';


@Component({
  selector: 'app-assets-table',
  standalone: true,
  imports: [CommonModule, DataTableComponent, SearchFilterComponent],
  template: `
    <div class="assets-table">
      <div class="header">
        <h2>Assets</h2>
        <button *ngIf="roleService.canManageAssets()" class="btn btn-primary" (click)="createAsset()">
          Add Asset
        </button>
      </div>

      <app-search-filter
        searchPlaceholder="Search assets by name, tag, model, or serial number..."
        [filterOptions]="filterOptions"
        (search)="onSearch($event)"
        (filtersChange)="onFiltersChange($event)">
      </app-search-filter>

      <app-data-table
        [data]="assets"
        [columns]="columns"
        [actions]="actions"
        [pagination]="pagination"
        [sortColumn]="sortColumn"
        [sortDirection]="sortDirection"
        (pageChange)="onPageChange($event)"
        (sort)="onSort($event)"
        [rowClickAction]="true"
        (rowClick)="onAssetClick($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .assets-table {
      width: 100%;
      max-width: 100vw;
      overflow-x: auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .header h2 {
      margin: 0;
      color: var(--gray-900);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .btn {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--primary-600);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-700);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .header h2 {
        text-align: center;
        font-size: 1.25rem;
      }
      
      .btn {
        justify-content: center;
        width: 100%;
      }
    }

    @media (max-width: 640px) {
      .assets-table {
        padding: 0 var(--space-2);
      }
      
      .header {
        margin-bottom: var(--space-4);
      }
    }
  `]
})
export class AssetsTableComponent implements OnInit {
  assets: Asset[] = [];
  pagination: any = null;
  searchTerm = '';
  filters: SearchFilters = {};
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns: TableColumn[] = [
    { key: 'assetTag', label: 'Asset Tag', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'cost', label: 'Cost', pipe: 'currencyFormat' }
  ];

  filterOptions: FilterOption[] = [
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'HARDWARE', label: 'Hardware' },
        { value: 'SOFTWARE', label: 'Software' },
        { value: 'ACCESSORIES', label: 'Accessories' }
      ]
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'LAPTOP', label: 'Laptop' },
        { value: 'DESKTOP', label: 'Desktop' },
        { value: 'MONITOR', label: 'Monitor' },
        { value: 'PRINTER', label: 'Printer' },
        { value: 'PHONE', label: 'Phone' },
        { value: 'TABLET', label: 'Tablet' },
        { value: 'SERVER', label: 'Server' },
        { value: 'NETWORK_EQUIPMENT', label: 'Network Equipment' },
        { value: 'SOFTWARE_LICENSE', label: 'Software License' },
        { value: 'OTHER', label: 'Other' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'AVAILABLE', label: 'Available' },
        { value: 'ALLOCATED', label: 'Allocated' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'RETIRED', label: 'Retired' },
        { value: 'LOST', label: 'Lost' }
      ]
    },
    {
      key: 'model',
      label: 'Model',
      type: 'text',
      placeholder: 'Filter by model'
    },
    {
      key: 'vendor',
      label: 'Vendor',
      type: 'text',
      placeholder: 'Filter by vendor'
    }
  ];

  actions: TableAction[] = [
    { 
      label: 'Edit', 
      action: (asset) => this.editAsset(asset.id), 
      condition: () => this.roleService.canManageAssets() 
    },
    { 
      label: 'Allocate', 
      action: (asset) => this.allocateAsset(asset.id), 
      condition: (asset) => asset.status === 'AVAILABLE' && this.roleService.canManageAssets()
    },
    { 
      label: 'Return', 
      action: (asset) => this.returnAsset(asset.id), 
      condition: (asset) => asset.status === 'ALLOCATED' && this.roleService.canManageAssets()
    },
    { 
      label: 'Delete', 
      action: (asset) => this.deleteAsset(asset.id), 
      condition: () => this.roleService.canManageAssets()
    }
  ];



  constructor(
    private assetService: AssetService,
    private router: Router,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService,
    public roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadAssets();
  }

  loadAssets(page: number = 0) {
    const hasSearch = this.searchTerm && this.searchTerm.trim() !== '';
    const hasFilters = Object.values(this.filters).some(value => value !== null && value !== undefined && value !== '');
    
    if (hasSearch || hasFilters) {
      this.searchAssets(page);
    } else {
      this.assetService.getAssets(page, 10, this.sortColumn, this.sortDirection).subscribe({
        next: (response) => {
          this.assets = response.content || [];
          this.pagination = {
            page: response.number || 0,
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0
          };
        },
        error: () => {
          this.toastService.error('Failed to load assets');
        }
      });
    }
  }

  searchAssets(page: number = 0) {
    const searchParams: any = {
      sortBy: this.sortColumn,
      sortDir: this.sortDirection
    };
    
    // Add search term to relevant fields if provided
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      searchParams.name = this.searchTerm.trim();
      searchParams.assetTag = this.searchTerm.trim();
      searchParams.model = this.searchTerm.trim();
      searchParams.serialNumber = this.searchTerm.trim();
    }
    
    // Add individual filters
    Object.keys(this.filters).forEach(key => {
      const value = this.filters[key];
      if (value !== null && value !== undefined && value !== '') {
        searchParams[key] = value;
      }
    });

    this.assetService.searchAssets(searchParams, page, 10).subscribe({
      next: (response) => {
        this.assets = response.content || [];
        this.pagination = {
          page: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        };
      },
      error: () => {
        this.toastService.error('Failed to search assets');
      }
    });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.loadAssets(0);
  }

  onFiltersChange(filters: SearchFilters) {
    this.filters = filters;
    this.loadAssets(0);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.loadAssets(0);
  }

  onPageChange(page: number) {
    this.loadAssets(page);
  }

  createAsset() {
    this.router.navigate(['/assets/new']);
  }

  viewAsset(asset: Asset) {
    this.router.navigate(['/assets', asset.id]);
  }

  editAsset(id: number) {
    this.router.navigate(['/assets', id, 'edit']);
  }

  allocateAsset(id: number) {
    this.router.navigate(['/assets', id, 'allocate']);
  }

  returnAsset(id: number) {
    this.confirmDialog.confirmDelete('return this asset').subscribe(confirmed => {
      if (confirmed) {
        this.assetService.returnAsset(id).subscribe({
          next: () => {
            this.toastService.success('Asset returned successfully');
            this.loadAssets();
          },
          error: () => {
            this.toastService.error('Failed to return asset');
          }
        });
      }
    });
  }

  deleteAsset(id: number) {
    this.confirmDialog.confirmDelete('asset').subscribe(confirmed => {
      if (confirmed) {
        this.assetService.deleteAsset(id).subscribe({
          next: () => {
            this.toastService.success('Asset deleted successfully');
            this.loadAssets();
          },
          error: () => {
            this.toastService.error('Failed to delete asset');
          }
        });
      }
    });
  }

  onAssetClick = (asset: Asset) => {
    this.viewAsset(asset);
  }
}