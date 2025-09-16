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
  `]
})
export class UserAssetsPageComponent implements OnInit {
  assets: Asset[] = [];
  user: User | null = null;
  pagination: any = null;
  
  columns: TableColumn[] = [
    { key: 'assetTag', label: 'Asset Tag', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', badge: true },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status', badge: true },
    { key: 'allocatedDate', label: 'Allocated Date', render: (item) => item.allocatedDate ? new Date(item.allocatedDate).toLocaleDateString() : 'N/A' }
  ];

  actions: TableAction[] = [
    {
      label: 'Request Return',
      action: (asset) => this.requestReturn(asset),
      condition: (asset) => asset.status === 'ALLOCATED'
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
      },
      error: () => {
        this.assets = [];
        this.pagination = null;
      }
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