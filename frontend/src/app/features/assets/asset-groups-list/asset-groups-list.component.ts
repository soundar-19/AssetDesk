import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssetService } from '../../../core/services/asset.service';
import { RoleService } from '../../../core/services/role.service';

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
  selector: 'app-asset-groups-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Asset Groups</h1>
        <p class="page-description">View assets grouped by model and type</p>
      </div>

      <div class="filters mb-6">
        <select class="form-select" (change)="filterByCategory($event)">
          <option value="">All Categories</option>
          <option value="HARDWARE">Hardware</option>
          <option value="SOFTWARE">Software</option>
          <option value="ACCESSORIES">Accessories</option>
        </select>
      </div>

      <div class="asset-groups-grid">
        <div *ngFor="let group of filteredGroups" class="asset-group-card card card-hover clickable" (click)="viewGroupDetails(group)">
          <div class="card-body">
            <div class="group-header">
              <div class="group-info">
                <h3 class="group-name">{{ group.name }}</h3>
                <span class="badge badge-info">Asset Group</span>
              </div>
              <div class="group-total">
                <span class="total-count">{{ group.total }}</span>
                <span class="total-label">Total Assets</span>
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

            <div class="group-actions" (click)="$event.stopPropagation()">

              <button 
                *ngIf="group.available > 0 && roleService.canManageAssets()" 
                class="btn btn-primary btn-sm" 
                (click)="allocateAsset(group)">
                Allocate Asset
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
  `,
  styles: [`
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

    .asset-group-card.clickable {
      cursor: pointer;
    }

    @media (max-width: 768px) {
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
export class AssetGroupsListComponent implements OnInit {
  assetGroups: AssetGroup[] = [];
  filteredGroups: AssetGroup[] = [];
  loading = true;

  constructor(
    private assetService: AssetService,
    private router: Router,
    public roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadAssetGroups();
  }

  loadAssetGroups() {
    this.assetService.getAssetGroups().subscribe({
      next: (groups) => {
        this.assetGroups = groups;
        this.filteredGroups = groups;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterByCategory(event: any) {
    this.filteredGroups = this.assetGroups;
  }

  viewGroupDetails(group: AssetGroup) {
    this.router.navigate(['/assets/group', group.name]);
  }

  allocateAsset(group: AssetGroup) {
    this.router.navigate(['/assets/allocate'], { 
      queryParams: { 
        group: group.name
      }
    });
  }
}