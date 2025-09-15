import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AssetService } from '../../core/services/asset.service';
import { RoleService } from '../../core/services/role.service';
import { Asset } from '../../core/models';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-assets-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

      <div class="assets-section">
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
              </div>
            </div>
          </div>

          <div *ngIf="filteredGroups.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No asset groups found</h3>
            <p>No assets match your current filters.</p>
          </div>
        </div>

        <!-- List View -->
        <div *ngIf="!showGrouped" class="list-view">
          <div class="assets-grid">
            <div *ngFor="let asset of filteredAssets" class="asset-card" (click)="viewAsset(asset.id)">
              <div class="asset-header">
                <span class="asset-tag">{{ asset.assetTag }}</span>
                <span class="status-badge" [class]="'status-' + asset.status.toLowerCase()">{{ asset.status }}</span>
              </div>
              <h4 class="asset-name">{{ asset.name }}</h4>
              <p class="asset-details">{{ asset.category }} • {{ asset.type }}</p>
              <div *ngIf="asset.model" class="asset-model">{{ asset.model }}</div>
              <div *ngIf="asset.allocatedTo" class="allocated-info">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
                {{ asset.allocatedTo.name }}
              </div>
            </div>
          </div>
          
          <div *ngIf="filteredAssets.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No assets found</h3>
            <p>No assets match your current filters.</p>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading assets...</p>
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

    .form-select {
      min-width: 140px;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      background: white;
      transition: border-color 0.2s;
    }

    .form-select:focus {
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
      cursor: pointer;
    }

    .card-body {
      padding: var(--space-8);
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

    .badge {
      padding: var(--space-1) var(--space-2-5);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-info {
      background: var(--primary-100);
      color: var(--primary-700);
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

    .list-view {
      padding: var(--space-6);
    }

    .assets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-6);
    }

    .asset-card {
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .asset-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: var(--gray-300);
    }

    .asset-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }

    .asset-tag {
      font-family: monospace;
      background: var(--gray-100);
      padding: var(--space-1-5) var(--space-2-5);
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--gray-700);
    }

    .status-badge {
      padding: var(--space-1) var(--space-2-5);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-available { background: var(--success-100); color: var(--success-700); }
    .status-allocated { background: var(--primary-100); color: var(--primary-700); }
    .status-maintenance { background: var(--warning-100); color: var(--warning-700); }
    .status-retired { background: var(--gray-100); color: var(--gray-700); }

    .asset-name {
      margin: 0 0 var(--space-2) 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    .asset-details {
      margin: 0 0 var(--space-2) 0;
      color: var(--gray-600);
      font-size: 0.875rem;
    }

    .asset-model {
      font-size: 0.875rem;
      color: var(--gray-500);
      margin-bottom: var(--space-3);
      font-style: italic;
    }

    .allocated-info {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 0.875rem;
      color: var(--primary-600);
      font-weight: 500;
      background: var(--primary-50);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
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

      .asset-groups-grid {
        grid-template-columns: 1fr;
      }

      .assets-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AssetsPageComponent implements OnInit {
  showGrouped = true;
  loading = true;
  
  assetGroups: any[] = [];
  filteredGroups: any[] = [];
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  
  filters = {
    category: '',
    type: ''
  };

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
      error: () => {
        this.assetGroups = [];
        this.filteredGroups = [];
        this.toastService.error('Failed to load asset groups');
        this.loading = false;
      }
    });
  }

  loadAssets() {
    this.loading = true;
    this.assetService.getAssets(0, 50).subscribe({
      next: (response) => {
        this.assets = response?.content || [];
        this.applyAssetFilters();
        this.loading = false;
      },
      error: () => {
        this.assets = [];
        this.filteredAssets = [];
        this.toastService.error('Failed to load assets');
        this.loading = false;
      }
    });
  }

  applyAssetFilters() {
    let filtered = [...this.assets];
    
    if (this.filters.category) {
      filtered = filtered.filter(asset => asset.category === this.filters.category);
    }
    if (this.filters.type) {
      filtered = filtered.filter(asset => asset.type === this.filters.type);
    }
    
    this.filteredAssets = filtered;
  }

  applyFilters() {
    if (this.showGrouped) {
      this.filteredGroups = this.assetGroups.filter(group => {
        if (this.filters.category && group.category !== this.filters.category) {
          return false;
        }
        if (this.filters.type && !group.name.toLowerCase().includes(this.filters.type.toLowerCase())) {
          return false;
        }
        return true;
      });
    } else {
      this.applyAssetFilters();
    }
  }

  setView(grouped: boolean) {
    if (this.showGrouped !== grouped) {
      this.showGrouped = grouped;
      this.loadData();
    }
  }

  createAsset() {
    this.router.navigate(['/assets/new']);
  }

  viewAsset(id: number) {
    this.router.navigate(['/assets', id]);
  }

  viewGroupDetails(group: any) {
    this.router.navigate(['/assets/group', encodeURIComponent(group.name)]);
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