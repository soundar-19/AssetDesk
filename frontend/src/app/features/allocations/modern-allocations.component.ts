import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllocationService } from '../../core/services/allocation.service';
import { RoleService } from '../../core/services/role.service';
import { AssetAllocation } from '../../core/models/allocation.model';
import { ROLES } from '../../core/constants/role.constants';
import { ProfessionalHeaderComponent } from '../../shared/components/professional-header/professional-header.component';
import { ModernCardComponent } from '../../shared/components/modern-card/modern-card.component';

@Component({
  selector: 'app-modern-allocations',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfessionalHeaderComponent, ModernCardComponent],
  template: `
    <div class="allocations-dashboard">
      <!-- Professional Header -->
      <app-professional-header 
        title="Asset Allocations"
        subtitle="Manage and track asset assignments across your organization"
        [stats]="getHeaderStats()">
        <div slot="actions" *ngIf="canManageAllocations">
          <button class="btn btn-primary" (click)="navigateToAllocate()">
            <span class="icon">➕</span>
            Allocate Asset
          </button>
        </div>
      </app-professional-header>

      <!-- Filters Section -->
      <app-modern-card title="Filter & Search" subtitle="Refine your allocation view" class="filters-card">
        <div class="filters-container">
          <div class="filter-group">
            <label for="statusFilter">Status</label>
            <select id="statusFilter" [(ngModel)]="selectedStatus" (change)="applyFilters()" class="form-control">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="searchFilter">Search</label>
            <input 
              id="searchFilter" 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="onSearchChange()"
              placeholder="Search by asset or user..."
              class="form-control">
          </div>
          <div class="filter-actions">
            <button class="btn btn-outline" (click)="clearFilters()">Clear Filters</button>
          </div>
        </div>
      </app-modern-card>

      <!-- Allocations Grid -->
      <div class="allocations-grid" *ngIf="!loading; else loadingTemplate">
        <div class="allocation-card" *ngFor="let allocation of allocations" 
             [class.active]="allocation.status === 'ACTIVE'"
             [class.returned]="allocation.status === 'RETURNED'">
          
          <div class="card-header">
            <div class="asset-info">
              <h3 class="asset-name">{{ allocation.assetName }}</h3>
              <span class="asset-tag">{{ allocation.assetTag }}</span>
              <span class="asset-category">{{ allocation.assetCategory }}</span>
            </div>
            <div class="status-badge" [class]="allocation.status.toLowerCase()">
              {{ allocation.status }}
            </div>
          </div>

          <div class="card-body">
            <div class="user-info">
              <div class="user-avatar">{{ allocation.userName.charAt(0).toUpperCase() }}</div>
              <div class="user-details">
                <p class="user-name">{{ allocation.userName }}</p>
                <p class="user-email">{{ allocation.userEmail }}</p>
              </div>
            </div>

            <div class="allocation-details">
              <div class="detail-item">
                <span class="label">Allocated:</span>
                <span class="value">{{ formatDate(allocation.allocatedDate) }}</span>
              </div>
              <div class="detail-item" *ngIf="allocation.returnedDate">
                <span class="label">Returned:</span>
                <span class="value">{{ formatDate(allocation.returnedDate) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Duration:</span>
                <span class="value">{{ allocation.daysAllocated }} days</span>
              </div>
            </div>

            <div class="remarks" *ngIf="allocation.remarks">
              <p class="remarks-text">{{ allocation.remarks }}</p>
            </div>
          </div>

          <div class="card-actions" *ngIf="canManageAllocations && allocation.status === 'ACTIVE'">
            <button class="btn btn-sm btn-outline" (click)="returnAsset(allocation)">
              Return Asset
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && allocations.length === 0">
        <div class="empty-icon">📦</div>
        <h3>No Allocations Found</h3>
        <p>{{ getEmptyStateMessage() }}</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="pagination && pagination.totalPages > 1">
        <button 
          class="btn btn-outline btn-sm" 
          [disabled]="pagination.page === 0"
          (click)="changePage(pagination.page - 1)">
          Previous
        </button>
        <span class="page-info">
          Page {{ pagination.page + 1 }} of {{ pagination.totalPages }}
        </span>
        <button 
          class="btn btn-outline btn-sm" 
          [disabled]="pagination.page >= pagination.totalPages - 1"
          (click)="changePage(pagination.page + 1)">
          Next
        </button>
      </div>
    </div>

    <!-- Loading Template -->
    <ng-template #loadingTemplate>
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading allocations...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .allocations-dashboard {
      padding: var(--space-6);
      max-width: 1400px;
      margin: 0 auto;
    }



    .filters-card {
      margin-bottom: var(--space-6);
    }

    .filters-container {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: var(--space-4);
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .filter-group label {
      font-weight: 500;
      color: var(--gray-700);
      font-size: 0.875rem;
    }

    .filter-actions {
      display: flex;
      align-items: end;
    }

    .allocations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: var(--space-6);
      margin-bottom: var(--space-8);
    }

    .allocation-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .allocation-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .allocation-card.active {
      border-left: 4px solid var(--success-500);
    }

    .allocation-card.returned {
      border-left: 4px solid var(--gray-400);
    }

    .card-header {
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .asset-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 var(--space-1) 0;
    }

    .asset-tag {
      background: var(--gray-100);
      color: var(--gray-700);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
      margin-right: var(--space-2);
    }

    .asset-category {
      background: var(--primary-100);
      color: var(--primary-700);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge {
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: var(--success-100);
      color: var(--success-700);
    }

    .status-badge.returned {
      background: var(--gray-100);
      color: var(--gray-700);
    }

    .card-body {
      padding: var(--space-6);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-500);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .user-name {
      font-weight: 500;
      color: var(--gray-900);
      margin: 0;
    }

    .user-email {
      color: var(--gray-600);
      font-size: 0.875rem;
      margin: 0;
    }

    .allocation-details {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-item .label {
      color: var(--gray-600);
      font-size: 0.875rem;
    }

    .detail-item .value {
      color: var(--gray-900);
      font-weight: 500;
      font-size: 0.875rem;
    }

    .remarks {
      background: var(--gray-50);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      border-left: 3px solid var(--info-500);
    }

    .remarks-text {
      color: var(--gray-700);
      font-size: 0.875rem;
      margin: 0;
      font-style: italic;
    }

    .card-actions {
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--gray-200);
      background: var(--gray-50);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-12);
      color: var(--gray-600);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--space-4);
    }

    .empty-state h3 {
      color: var(--gray-900);
      margin-bottom: var(--space-2);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--space-4);
      margin-top: var(--space-8);
    }

    .page-info {
      color: var(--gray-600);
      font-size: 0.875rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12);
      color: var(--gray-600);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--gray-200);
      border-top: 3px solid var(--primary-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-4);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .allocations-dashboard {
        padding: var(--space-4);
      }

      .filters-container {
        grid-template-columns: 1fr;
        gap: var(--space-4);
      }

      .filter-actions {
        justify-content: stretch;
      }

      .filter-actions .btn {
        width: 100%;
      }

      .allocations-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ModernAllocationsComponent implements OnInit {
  allocations: AssetAllocation[] = [];
  analytics: any = null;
  pagination: any = null;
  loading = true;
  selectedStatus = '';
  searchTerm = '';
  searchTimeout: any;

  constructor(
    private allocationService: AllocationService,
    public roleService: RoleService
  ) {}

  get canManageAllocations(): boolean {
    return this.roleService.hasAnyRole([ROLES.ADMIN, ROLES.IT_SUPPORT]);
  }

  ngOnInit() {
    this.loadAnalytics();
    this.loadAllocations();
  }

  loadAnalytics() {
    this.allocationService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
      },
      error: (error) => {
        console.error('Failed to load analytics:', error);
      }
    });
  }

  loadAllocations(page: number = 0) {
    this.loading = true;
    this.allocationService.getAllocationsWithFilters(
      page, 10, this.selectedStatus || undefined, this.searchTerm || undefined
    ).subscribe({
      next: (response) => {
        this.allocations = response?.content || [];
        this.pagination = {
          page: response?.number || 0,
          totalPages: response?.totalPages || 0,
          totalElements: response?.totalElements || 0
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load allocations:', error);
        this.allocations = [];
        this.pagination = { page: 0, totalPages: 0, totalElements: 0 };
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.loadAllocations();
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadAllocations();
    }, 500);
  }

  clearFilters() {
    this.selectedStatus = '';
    this.searchTerm = '';
    this.loadAllocations();
  }

  changePage(page: number) {
    this.loadAllocations(page);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getEmptyStateMessage(): string {
    if (this.selectedStatus || this.searchTerm) {
      return 'No allocations match your current filters. Try adjusting your search criteria.';
    }
    return 'No asset allocations found. Start by allocating assets to users.';
  }

  navigateToAllocate() {
    // Navigate to allocation form
    window.location.href = '/assets/allocate';
  }

  returnAsset(allocation: AssetAllocation) {
    // Implement return asset functionality
    console.log('Return asset:', allocation);
  }

  getHeaderStats() {
    if (!this.analytics) return [];
    return [
      { icon: '📊', value: this.analytics.totalAllocations.toString(), label: 'Total Allocations' },
      { icon: '✅', value: this.analytics.activeAllocations.toString(), label: 'Active' },
      { icon: '🔄', value: this.analytics.returnedAllocations.toString(), label: 'Returned' },
      { icon: '📈', value: `${this.analytics.utilizationRate.toFixed(1)}%`, label: 'Utilization' }
    ];
  }
}