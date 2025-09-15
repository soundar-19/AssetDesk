import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssetService } from '../../../core/services/asset.service';
import { RoleService } from '../../../core/services/role.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/ui/loading-spinner.component';
import { AssetsTableComponent } from '../assets-table/assets-table.component';

interface AssetGroup {
  name: string;
  model: string;
  category: string;
  type: string;
  total: number;
  available: number;
  allocated: number;
  maintenance: number;
  retired: number;
  averageCost: number;
  vendor?: string;
}

@Component({
  selector: 'app-assets-list',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, LoadingSpinnerComponent, AssetsTableComponent],
  template: `
    <main class="page-container" role="main">
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Assets</h1>
          <p class="page-description">Manage your organization's assets and equipment</p>
        </div>
        <div class="header-actions">
          <div class="view-toggle">
            <button 
              class="btn btn-outline btn-sm"
              [class.active]="showGrouped"
              (click)="toggleView()"
              [attr.aria-label]="'Switch to ' + (showGrouped ? 'table' : 'grouped') + ' view'">
              <svg *ngIf="showGrouped" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <svg *ngIf="!showGrouped" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/>
              </svg>
              {{ showGrouped ? 'Table View' : 'Group View' }}
            </button>
          </div>
          <button *ngIf="roleService.canManageAssets()" 
                  class="btn btn-primary" 
                  (click)="createAsset()"
                  [attr.aria-label]="'Add new asset'">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
            Add Asset
          </button>
        </div>
      </header>

      <section class="filters mb-6" aria-label="Filter options">
        <div class="filter-group">
          <label for="categoryFilter" class="filter-label">Category</label>
          <select id="categoryFilter" class="form-select" (change)="filterByCategory($event)" aria-label="Filter assets by category">
            <option value="">All Categories</option>
            <option value="HARDWARE">Hardware</option>
            <option value="SOFTWARE">Software</option>
            <option value="ACCESSORIES">Accessories</option>
          </select>
        </div>
      </section>

      <section *ngIf="showGrouped" class="asset-groups-grid" aria-label="Asset groups">
        <article *ngFor="let group of filteredGroups; trackBy: trackByGroupName" 
                 class="asset-group-card card card-hover clickable" 
                 [attr.aria-label]="'Asset group: ' + group.name"
                 (click)="viewGroupDetails(group)">
          <div class="card-body">
            <header class="group-header">
              <div class="group-info">
                <h2 class="group-name">{{ group.name }}</h2>
                <span class="badge badge-info" aria-label="Asset group type">Asset Group</span>
              </div>
              <div class="group-total" role="group" aria-label="Total assets">
                <span class="total-count">{{ group.total }}</span>
                <span class="total-label">Total</span>
              </div>
            </header>

            <div class="status-breakdown" role="group" aria-label="Asset status breakdown">
              <div class="status-item">
                <div class="status-count available" [attr.aria-label]="group.available + ' available assets'">{{ group.available }}</div>
                <div class="status-label">Available</div>
              </div>
              <div class="status-item">
                <div class="status-count allocated" [attr.aria-label]="group.allocated + ' allocated assets'">{{ group.allocated }}</div>
                <div class="status-label">Allocated</div>
              </div>
              <div class="status-item">
                <div class="status-count maintenance" [attr.aria-label]="group.maintenance + ' assets in maintenance'">{{ group.maintenance }}</div>
                <div class="status-label">Maintenance</div>
              </div>
              <div class="status-item" *ngIf="group.retired > 0">
                <div class="status-count retired" [attr.aria-label]="group.retired + ' retired assets'">{{ group.retired }}</div>
                <div class="status-label">Retired</div>
              </div>
            </div>

            <footer class="group-actions" (click)="$event.stopPropagation()">

              <button 
                *ngIf="group.available > 0 && roleService.canManageAssets()" 
                class="btn btn-primary btn-sm" 
                (click)="allocateAsset(group)"
                [attr.aria-label]="'Allocate assets from ' + group.name + ', ' + group.available + ' available'">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                Allocate ({{ group.available }})
              </button>
            </footer>
          </div>
        </article>
      </section>

      <section *ngIf="!showGrouped" class="individual-assets" aria-label="Individual assets view">
        <app-assets-table></app-assets-table>
      </section>

      <app-empty-state 
        *ngIf="filteredGroups.length === 0 && !loading"
        icon="📦"
        title="No Assets Found"
        description="No assets match your current filters. Try adjusting your search criteria."
        [actionText]="roleService.canManageAssets() ? 'Add First Asset' : ''"
        (action)="createAsset()"
        role="status">
      </app-empty-state>
      
      <div *ngIf="loading" class="loading-state" role="status" aria-live="polite">
        <app-loading-spinner size="lg" message="Loading assets..."></app-loading-spinner>
      </div>
    </main>
  `,
  styles: [`
    .header-actions {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }

    .view-toggle {
      display: flex;
      align-items: center;
    }

    .btn-outline {
      background: white;
      border: 1px solid var(--gray-300);
      color: var(--gray-700);
    }

    .btn-outline:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }

    .btn-outline.active {
      background: var(--primary-50);
      border-color: var(--primary-300);
      color: var(--primary-700);
    }

    .btn-sm {
      padding: var(--space-2) var(--space-3);
      font-size: 0.75rem;
    }

    .filters {
      display: flex;
      gap: var(--space-4);
    }

    .form-select {
      min-width: 200px;
    }

    .asset-groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: var(--space-8);
      margin-top: var(--space-6);
    }

    .asset-group-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-xl);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      position: relative;
    }

    .asset-group-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
    }

    .asset-group-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border-color: var(--primary-200);
    }

    .asset-group-card.clickable {
      cursor: pointer;
    }

    .card-body {
      cursor: pointer;
    }

    .card-body {
      padding: var(--space-6);
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
    }

    .group-info {
      flex: 1;
    }

    .group-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0 0 var(--space-2) 0;
      line-height: 1.3;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-info {
      background: var(--primary-100);
      color: var(--primary-700);
    }

    .group-total {
      text-align: center;
      background: var(--primary-50);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      min-width: 80px;
    }

    .total-count {
      display: block;
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--primary-600);
      line-height: 1;
      margin-bottom: var(--space-1);
    }

    .total-label {
      font-size: 0.75rem;
      color: var(--primary-600);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
    }

    .status-breakdown {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-6);
      padding: var(--space-5);
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
    }

    .status-item {
      text-align: center;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      background: white;
      transition: transform 0.2s ease;
    }

    .status-item:hover {
      transform: translateY(-2px);
    }

    .status-count {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: var(--space-2);
    }

    .status-count.available { 
      color: var(--success-600);
      text-shadow: 0 1px 2px rgba(34, 197, 94, 0.1);
    }
    .status-count.allocated { 
      color: var(--primary-600);
      text-shadow: 0 1px 2px rgba(59, 130, 246, 0.1);
    }
    .status-count.maintenance { 
      color: var(--warning-600);
      text-shadow: 0 1px 2px rgba(245, 158, 11, 0.1);
    }
    .status-count.retired { 
      color: var(--gray-500);
      text-shadow: 0 1px 2px rgba(107, 114, 128, 0.1);
    }

    .status-label {
      font-size: 0.75rem;
      color: var(--gray-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 500;
    }

    .group-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .group-actions .btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .group-actions .btn-outline {
      background: white;
      border: 1px solid var(--gray-300);
      color: var(--gray-700);
    }

    .group-actions .btn-outline:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
      transform: translateY(-1px);
    }

    .group-actions .btn-primary {
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      border: none;
      color: white;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    }

    .group-actions .btn-primary:hover {
      background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-12);
      color: var(--gray-500);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: var(--space-4);
    }

    .individual-assets {
      width: 100%;
      overflow-x: auto;
    }
    
    .individual-assets :deep(.data-table) {
      width: 100%;
      table-layout: fixed;
      font-size: 0.875rem;
    }
    
    .individual-assets :deep(.data-table th),
    .individual-assets :deep(.data-table td) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0.5rem 0.25rem;
      max-width: 0;
    }

    @media (max-width: 1024px) {
      .asset-groups-grid {
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--space-6);
      }
    }

    @media (max-width: 768px) {
      .asset-groups-grid {
        grid-template-columns: 1fr;
        gap: var(--space-4);
      }
      
      .group-header {
        flex-direction: column;
        gap: var(--space-3);
        align-items: center;
        text-align: center;
      }

      .group-total {
        order: -1;
        margin-bottom: var(--space-3);
      }

      .status-breakdown {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-3);
        padding: var(--space-4);
      }

      .group-actions {
        justify-content: stretch;
        gap: var(--space-2);
      }

      .group-actions .btn {
        flex: 1;
        justify-content: center;
      }

      .header-actions {
        flex-wrap: wrap;
        gap: var(--space-2);
      }

      .filters {
        flex-direction: column;
        gap: var(--space-3);
      }

      .form-select {
        min-width: auto;
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .card-body {
        padding: var(--space-4);
      }

      .group-name {
        font-size: 1.125rem;
      }

      .total-count {
        font-size: 2rem;
      }

      .status-count {
        font-size: 1.25rem;
      }

      .status-breakdown {
        grid-template-columns: 1fr;
        gap: var(--space-2);
        padding: var(--space-3);
      }

      .group-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AssetsListComponent implements OnInit {
  assetGroups: AssetGroup[] = [];
  filteredGroups: AssetGroup[] = [];
  showGrouped = true;
  loading = true;

  constructor(
    private assetService: AssetService,
    private router: Router,
    public roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadAssetGroups();
  }

  trackByGroupName(index: number, group: AssetGroup): string {
    return group.name;
  }

  loadAssetGroups() {
    this.loading = true;
    this.assetService.getAssetGroups().subscribe({
      next: (groups) => {
        this.assetGroups = groups || [];
        this.filteredGroups = groups || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load asset groups:', error);
        this.assetGroups = [];
        this.filteredGroups = [];
        this.loading = false;
      }
    });
  }

  filterByCategory(event: any) {
    const category = event.target.value;
    if (!category) {
      this.filteredGroups = this.assetGroups;
    } else {
      this.filteredGroups = this.assetGroups.filter(group => 
        group.category === category
      );
    }
  }

  toggleView() {
    this.showGrouped = !this.showGrouped;
  }

  createAsset() {
    this.router.navigate(['/assets/new']);
  }

  viewGroupDetails(group: AssetGroup) {
    this.router.navigate(['/assets/group', encodeURIComponent(group.name)]);
  }

  allocateAsset(group: AssetGroup) {
    this.router.navigate(['/assets/allocate'], { 
      queryParams: { 
        group: group.name
      }
    });
  }
}