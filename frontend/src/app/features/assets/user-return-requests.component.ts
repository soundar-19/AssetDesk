import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetService } from '../../core/services/asset.service';
import { AllocationService } from '../../core/services/allocation.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-return-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="return-requests-page">
      <div class="header">
        <h1>Asset Return Requests</h1>
        <p>Assets that have been requested for return</p>
      </div>

      <div class="requests-list" *ngIf="returnRequests.length > 0; else noRequests">
        <div *ngFor="let request of returnRequests" class="request-card">
          <div class="asset-info">
            <div class="asset-name">{{ request.asset?.name || request.assetName || 'Unknown Asset' }}</div>
            <div class="asset-tag">{{ request.asset?.assetTag || request.assetTag || 'N/A' }}</div>
          </div>
          
          <div class="request-details">
            <div class="detail-item">
              <label>Requested Date:</label>
              <span>{{ formatDate(request.returnRequestDate) }}</span>
            </div>
            <div class="detail-item" *ngIf="request.returnRequestRemarks">
              <label>Reason:</label>
              <span>{{ request.returnRequestRemarks }}</span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <span class="status" [class]="getStatusClass(request)">
                {{ getStatusText(request) }}
              </span>
            </div>
          </div>
          
          <div class="actions">
            <button class="btn btn-primary" 
                    *ngIf="request.returnRequestDate && !isAcknowledged(request)" 
                    (click)="acknowledgeRequest(request)">
              Acknowledge Request
            </button>
            <button class="btn btn-success" 
                    *ngIf="isAcknowledged(request)" 
                    (click)="markAsReturned(request)">
              Mark as Returned
            </button>
            <button class="btn btn-secondary" (click)="viewAsset(request.assetId || request.asset?.id)">
              View Asset
            </button>
          </div>
        </div>
      </div>

      <ng-template #noRequests>
        <div class="empty-state">
          <i class="icon-return"></i>
          <h3>No Return Requests</h3>
          <p>You don't have any pending asset return requests.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .return-requests-page {
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: var(--space-8);
    }

    .header h1 {
      margin: 0 0 var(--space-2) 0;
      color: var(--gray-900);
      font-size: 1.875rem;
      font-weight: 700;
    }

    .header p {
      color: var(--gray-600);
      margin: 0;
    }

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .request-card {
      background: white;
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      display: grid;
      grid-template-columns: 1fr 2fr auto;
      gap: var(--space-6);
      align-items: center;
    }

    .asset-info .asset-name {
      font-weight: 600;
      color: var(--gray-900);
      font-size: 1.125rem;
      margin-bottom: var(--space-1);
    }

    .asset-info .asset-tag {
      color: var(--gray-600);
      font-family: var(--font-family-mono);
      font-size: 0.875rem;
    }

    .request-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .detail-item label {
      font-weight: 500;
      color: var(--gray-600);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-item span {
      color: var(--gray-900);
      font-weight: 500;
    }

    .status {
      display: inline-flex;
      align-items: center;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-xl);
      color: white;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      width: fit-content;
    }

    .status-requested {
      background: var(--warning-500);
    }

    .status-acknowledged {
      background: var(--success-500);
    }

    .btn-success {
      background: var(--success-600);
      color: white;
    }

    .btn-success:hover {
      background: var(--success-700);
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .btn {
      padding: var(--space-2) var(--space-4);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all var(--transition-fast);
      text-align: center;
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--primary-600);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-700);
    }

    .btn-secondary {
      background: var(--gray-100);
      color: var(--gray-700);
    }

    .btn-secondary:hover {
      background: var(--gray-200);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-12);
      color: var(--gray-600);
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: var(--space-4);
      color: var(--gray-400);
    }

    .empty-state h3 {
      margin: 0 0 var(--space-2) 0;
      color: var(--gray-900);
      font-size: 1.25rem;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .request-card {
        grid-template-columns: 1fr;
        gap: var(--space-4);
      }

      .actions {
        flex-direction: row;
      }
    }
  `]
})
export class UserReturnRequestsComponent implements OnInit {
  returnRequests: any[] = [];
  currentUser: any = null;

  constructor(
    private assetService: AssetService,
    private allocationService: AllocationService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadReturnRequests();
    }
  }

  loadReturnRequests() {
    console.log('Loading return requests for user:', this.currentUser.id);
    this.allocationService.getUserReturnRequests(this.currentUser.id).subscribe({
      next: (requests) => {
        console.log('Return requests received:', requests);
        this.returnRequests = requests || [];
      },
      error: (error) => {
        console.error('Error loading return requests:', error);
        this.toastService.error('Failed to load return requests');
      }
    });
  }

  acknowledgeRequest(request: any) {
    console.log('Acknowledging request:', request);
    console.log('Current user:', this.currentUser);
    
    const assetId = request.assetId || request.asset?.id;
    if (!assetId) {
      this.toastService.error('Invalid asset information');
      return;
    }
    
    this.allocationService.acknowledgeReturnRequest(assetId, this.currentUser.id).subscribe({
      next: (response) => {
        console.log('Acknowledge response:', response);
        this.toastService.success('Return request acknowledged. Please return the asset as soon as possible.');
        this.loadReturnRequests();
      },
      error: (error) => {
        console.error('Error acknowledging return request:', error);
        this.toastService.error(`Failed to acknowledge return request: ${error.message || 'Unknown error'}`);
      }
    });
  }

  viewAsset(assetId: number) {
    console.log('Navigating to asset:', assetId);
    if (!assetId) {
      this.toastService.error('Invalid asset ID');
      return;
    }
    this.router.navigate(['/assets', assetId]);
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  getStatusLabel(status: string): string {
    return 'Pending Response';
  }

  isAcknowledged(request: any): boolean {
    return request.returnStatus === 'ACKNOWLEDGED' || request.acknowledged === true;
  }

  getStatusClass(request: any): string {
    if (this.isAcknowledged(request)) {
      return 'status-acknowledged';
    }
    return 'status-requested';
  }

  getStatusText(request: any): string {
    if (this.isAcknowledged(request)) {
      return 'Ready to Return';
    }
    return 'Pending Response';
  }

  markAsReturned(request: any) {
    const assetId = request.assetId || request.asset?.id;
    if (!assetId) {
      this.toastService.error('Invalid asset information');
      return;
    }
    
    this.assetService.returnAsset(assetId, 'Asset returned by user').subscribe({
      next: () => {
        this.toastService.success('Asset marked as returned successfully');
        this.loadReturnRequests();
      },
      error: (error) => {
        console.error('Error marking asset as returned:', error);
        this.toastService.error('Failed to mark asset as returned');
      }
    });
  }
}