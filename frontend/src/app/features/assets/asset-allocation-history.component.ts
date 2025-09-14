import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AllocationService } from '../../core/services/allocation.service';
import { AssetService } from '../../core/services/asset.service';
import { AssetAllocation, Asset } from '../../core/models';

@Component({
  selector: 'app-asset-allocation-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="allocation-history">
      <div class="header">
        <div class="title-section">
          <h1>Allocation History</h1>
          <p *ngIf="asset">{{ asset.name }} ({{ asset.assetTag }})</p>
        </div>
        <button class="btn btn-secondary" (click)="goBack()">
          ← Back to Assets
        </button>
      </div>

      <div class="content" *ngIf="!loading; else loadingTemplate">
        <div class="history-list" *ngIf="allocations.length > 0; else noHistory">
          <div *ngFor="let allocation of allocations" class="allocation-card">
            <div class="card-header">
              <div class="user-info">
                <div class="user-name">{{ allocation.userName }}</div>
                <div class="user-email">{{ allocation.userEmail }}</div>
              </div>
              <div class="status-badge" [class]="allocation.status.toLowerCase()">
                {{ allocation.status }}
              </div>
            </div>
            
            <div class="card-body">
              <div class="allocation-details">
                <div class="detail-item">
                  <label>Allocated:</label>
                  <span>{{ formatDate(allocation.allocatedDate) }}</span>
                </div>
                <div class="detail-item" *ngIf="allocation.returnedDate">
                  <label>Returned:</label>
                  <span>{{ formatDate(allocation.returnedDate) }}</span>
                </div>
                <div class="detail-item">
                  <label>Duration:</label>
                  <span>{{ allocation.daysAllocated }} days</span>
                </div>
              </div>
              
              <div class="return-request" *ngIf="allocation.returnRequested">
                <div class="request-badge">Return Requested</div>
                <div class="request-date">{{ formatDate(allocation.returnRequestDate!) }}</div>
                <div class="request-remarks" *ngIf="allocation.returnRequestRemarks">
                  {{ allocation.returnRequestRemarks }}
                </div>
              </div>
              
              <div class="remarks" *ngIf="allocation.remarks">
                <strong>Remarks:</strong> {{ allocation.remarks }}
              </div>
            </div>
          </div>
        </div>

        <ng-template #noHistory>
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No Allocation History</h3>
            <p>This asset has never been allocated to any user.</p>
          </div>
        </ng-template>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading allocation history...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .allocation-history {
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-8);
      padding: var(--space-6);
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
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
      font-size: 1rem;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .allocation-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--gray-200);
      background: var(--gray-50);
    }

    .user-name {
      font-weight: 600;
      color: var(--gray-900);
      font-size: 1.125rem;
    }

    .user-email {
      color: var(--gray-600);
      font-size: 0.875rem;
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

    .allocation-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .detail-item label {
      font-weight: 500;
      color: var(--gray-600);
      font-size: 0.875rem;
    }

    .detail-item span {
      color: var(--gray-900);
      font-weight: 500;
    }

    .return-request {
      background: var(--warning-50);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      border-left: 3px solid var(--warning-500);
      margin-bottom: var(--space-4);
    }
    
    .request-badge {
      font-weight: 600;
      color: var(--warning-700);
      font-size: 0.875rem;
    }
    
    .request-date {
      color: var(--gray-600);
      font-size: 0.75rem;
      margin-top: var(--space-1);
    }
    
    .request-remarks {
      color: var(--gray-700);
      font-size: 0.875rem;
      margin-top: var(--space-2);
      font-style: italic;
    }
    
    .remarks {
      background: var(--gray-50);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      border-left: 3px solid var(--info-500);
      font-size: 0.875rem;
    }

    .empty-state, .loading-state {
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

    .loading-spinner {
      width: 40px;
      height: 40px;
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
      .allocation-history {
        padding: var(--space-4);
      }

      .header {
        flex-direction: column;
        gap: var(--space-4);
        align-items: stretch;
      }

      .allocation-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AssetAllocationHistoryComponent implements OnInit {
  asset: Asset | null = null;
  allocations: AssetAllocation[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private allocationService: AllocationService,
    private assetService: AssetService
  ) {}

  ngOnInit() {
    const assetId = this.route.snapshot.paramMap.get('id');
    if (assetId && !isNaN(+assetId)) {
      this.loadAssetAndHistory(+assetId);
    } else {
      this.router.navigate(['/assets']);
    }
  }

  loadAssetAndHistory(assetId: number) {
    this.loading = true;
    
    // Load asset details
    this.assetService.getAssetById(assetId).subscribe({
      next: (asset) => {
        this.asset = asset;
      },
      error: () => {
        this.router.navigate(['/assets']);
      }
    });

    // Load allocation history
    this.allocationService.getAllocationsByAsset(assetId).subscribe({
      next: (response) => {
        this.allocations = response || [];
        this.loading = false;
      },
      error: () => {
        this.allocations = [];
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  goBack() {
    this.router.navigate(['/assets']);
  }
}