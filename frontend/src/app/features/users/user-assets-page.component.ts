import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AssetService } from '../../core/services/asset.service';
import { UserService } from '../../core/services/user.service';
import { AllocationService } from '../../core/services/allocation.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { InputModalService } from '../../shared/components/input-modal/input-modal.service';
import { Asset, User } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-user-assets-page',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="user-assets-page">
      <div class="header">
        <div class="title-section">
          <h1>Assets for {{ user?.name }}</h1>
          <p *ngIf="user">{{ user.email }} • {{ user.department }}</p>
        </div>
        <button class="btn btn-secondary" (click)="goBack()">
          ← Back to Users
        </button>
      </div>

      <app-data-table
        [data]="assets"
        [columns]="columns"
        [actions]="actions"
        [pagination]="pagination"
        [rowClickAction]="true"
        (pageChange)="onPageChange($event)"
        (rowClick)="viewAsset($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .user-assets-page {
      padding: var(--space-6);
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
    }

    .title-section h1 {
      margin: 0 0 var(--space-2) 0;
      color: var(--gray-900);
      font-size: 1.875rem;
      font-weight: 700;
    }

    .title-section p {
      margin: 0;
      color: var(--gray-600);
      font-size: 0.875rem;
    }

    .btn {
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--gray-300);
      background: white;
      color: var(--gray-700);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      transition: all var(--transition-fast);
    }

    .btn:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }

    /* Action button styles for consistent sizing */
    :host ::ng-deep .action-btn {
      min-width: 120px;
      padding: 0.5rem 0.75rem !important;
      text-align: center;
      white-space: nowrap;
      font-size: 0.75rem;
      font-weight: 500;
    }

    :host ::ng-deep .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: var(--gray-100) !important;
      color: var(--gray-500) !important;
    }
  `]
})
export class UserAssetsPageComponent implements OnInit {
  assets: Asset[] = [];
  user: User | null = null;
  pagination: any = null;
  returnRequestedAssets = new Set<number>();
  
  columns: TableColumn[] = [
    { key: 'assetTag', label: 'Asset Tag', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', badge: true },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status', badge: true },
    { key: 'allocatedDate', label: 'Allocated Date', render: (item) => {
      // Check for allocation date in various possible fields
      const allocDate = item.allocatedDate || item.allocationDate || item.allocation?.allocatedDate || item.currentAllocation?.allocatedDate;
      if (allocDate) {
        return new Date(allocDate).toLocaleDateString();
      }
      // If no allocation date but asset is allocated, show status
      return item.status === 'ALLOCATED' ? 'Currently Allocated' : 'Not Allocated';
    } }
  ];

  actions: TableAction[] = [
    {
      label: (asset) => this.returnRequestedAssets.has(asset.id) ? 'Return Requested' : 'Request Return',
      action: (asset) => this.requestReturn(asset),
      condition: (asset) => asset.status === 'ALLOCATED',
      disabled: (asset) => this.returnRequestedAssets.has(asset.id)
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private assetService: AssetService,
    private userService: UserService,
    private allocationService: AllocationService,
    private toastService: ToastService,
    private inputModalService: InputModalService
  ) {}

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(+userId);
      this.loadUserAssets(+userId);
    }
  }

  loadUser(userId: number) {
    this.userService.getUserById(userId).subscribe({
      next: (user) => this.user = user,
      error: () => this.user = null
    });
  }

  loadUserAssets(userId: number, page: number = 0) {
    this.assetService.getAssetsByUser(userId, page, 10).subscribe({
      next: (response) => {
        this.assets = response.content || [];
        this.pagination = {
          page: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        };
        // Load allocation data for each asset
        this.loadAllocationDates(userId);
      },
      error: () => {
        this.assets = [];
        this.pagination = null;
      }
    });
  }

  loadAllocationDates(userId: number) {
    this.assets.forEach(asset => {
      this.allocationService.getCurrentAllocationByAsset(asset.id).subscribe({
        next: (allocation) => {
          if (allocation && allocation.userId === userId) {
            (asset as any).allocatedDate = allocation.allocatedDate;
          }
        },
        error: () => {
          // Ignore errors for assets without allocations
        }
      });
    });
  }

  onPageChange(page: number) {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUserAssets(+userId, page);
    }
  }

  viewAsset(asset: Asset) {
    this.router.navigate(['/assets', asset.id]);
  }

  async requestReturn(asset: Asset) {
    if (this.returnRequestedAssets.has(asset.id)) {
      this.toastService.info('Return request already sent for this asset');
      return;
    }

    const remarks = await this.inputModalService.promptText(
      'Request Asset Return',
      `Request return of ${asset.name} from ${this.user?.name}`,
      'Enter reason for return request...',
      '',
      false
    );
    
    if (remarks !== null) {
      this.allocationService.requestReturn(asset.id, remarks || '').subscribe({
        next: () => {
          this.toastService.success(`Return request sent for ${asset.name}`);
          this.returnRequestedAssets.add(asset.id);
          this.loadUserAssets(+this.route.snapshot.paramMap.get('id')!);
        },
        error: () => this.toastService.error('Failed to send return request')
      });
    }
  }

  goBack() {
    this.location.back();
  }
}