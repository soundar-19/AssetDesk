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
                 class="asset-group-card card card-hover" 
                 [attr.aria-label]="'Asset group: ' + group.name">
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

            <footer class="group-actions">
              <button class="btn btn-outline btn-sm" 
                      (click)="viewGroupDetails(group)"
                      [attr.aria-label]="'View details for ' + group.name">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                View Details
              </button>
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
        <app-loading-spinner [size]="40" message="Loading assets..."></app-loading-spinner>
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
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: var(--space-6);
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

    .group-details {
      color: var(--gray-600);
      font-size: 0.875rem;
      margin: 0 0 var(--space-2) 0;
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
      flex-wrap: wrap;
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

    @media (max-width: 768px) {
      .asset-groups-grid {
        grid-template-columns: 1fr;
      }
      
      .group-header {
        flex-direction: column;
        gap: var(--space-3);
      }

      .group-actions {
        justify-content: stretch;
      }

      .group-actions .btn {
        flex: 1;
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
    this.filteredGroups = this.assetGroups;
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