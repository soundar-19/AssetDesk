import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../../core/services/request.service';
import { AssetService } from '../../core/services/asset.service';
import { AuthService } from '../../core/services/auth.service';
import { RoleService } from '../../core/services/role.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AssetRequestResponse, Asset, PageResponse } from '../../core/models';

@Component({
  selector: 'app-asset-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="requests-container">
      <div class="header">
        <div>
          <h2>{{ isITSupport ? 'Asset Requests' : 'My Asset Requests' }}</h2>
          <p>{{ isITSupport ? 'Review and manage asset requests' : 'Track your asset requests' }}</p>
        </div>
        <button *ngIf="canCreateRequest" class="btn btn-primary" (click)="createRequest()">
          New Request
        </button>
      </div>

      <div class="requests-grid" *ngIf="!loading">
        <div class="request-card" *ngFor="let request of requests" 
             [class]="'status-' + request.status.toLowerCase()">
          <div class="card-header">
            <div class="request-info">
              <h3>{{ request.requestType }} - {{ request.requestedCategory }}</h3>
              <span class="request-id">#{{ request.id }}</span>
            </div>
            <span class="status-badge" [class]="'status-' + request.status.toLowerCase()">
              {{ request.status }}
            </span>
          </div>

          <div class="card-body">
            <div class="request-details">
              <div class="detail-row" *ngIf="request.requestedType">
                <span class="label">Type:</span>
                <span class="value">{{ request.requestedType }}</span>
              </div>
              <div class="detail-row" *ngIf="request.requestedModel">
                <span class="label">Model:</span>
                <span class="value">{{ request.requestedModel }}</span>
              </div>
              <div class="detail-row" *ngIf="isITSupport">
                <span class="label">Requested by:</span>
                <span class="value">{{ request.requesterName }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">{{ formatDate(request.createdAt) }}</span>
              </div>
            </div>

            <div class="justification" *ngIf="request.justification">
              <h4>Justification:</h4>
              <p>{{ request.justification }}</p>
            </div>

            <div class="decision-info" *ngIf="request.status !== 'PENDING'">
              <h4>Decision:</h4>
              <p><strong>{{ request.decisionByName }}</strong> - {{ formatDate(request.decisionAt!) }}</p>
              <p *ngIf="request.decisionRemarks">{{ request.decisionRemarks }}</p>
            </div>
          </div>

          <div class="card-actions" *ngIf="isITSupport && request.status === 'PENDING'">
            <button class="btn btn-sm btn-success" (click)="showAllocationDialog(request)">
              Allocate Asset
            </button>
            <button class="btn btn-sm btn-outline" (click)="approveRequest(request)">
              Approve
            </button>
            <button class="btn btn-sm btn-danger" (click)="rejectRequest(request)">
              Reject
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading requests...</div>
      <div *ngIf="!loading && requests.length === 0" class="empty-state">
        <h3>No requests found</h3>
        <p *ngIf="!isITSupport">You haven't submitted any asset requests yet.</p>
        <p *ngIf="isITSupport">No pending asset requests at the moment.</p>
      </div>
    </div>

    <!-- Allocation Dialog -->
    <div *ngIf="showDialog" class="dialog-overlay" (click)="closeDialog()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>Allocate Asset</h3>
          <button class="close-btn" (click)="closeDialog()">×</button>
        </div>
        <div class="dialog-body">
          <p>Select an available asset to allocate to <strong>{{ selectedRequest?.requesterName }}</strong></p>
          
          <div class="asset-selection">
            <label>Available Assets:</label>
            <select [(ngModel)]="selectedAssetId" class="form-control">
              <option value="">Select an asset</option>
              <option *ngFor="let asset of availableAssets" [value]="asset.id">
                {{ asset.assetTag }} - {{ asset.name }}
              </option>
            </select>
          </div>

          <div class="remarks-section">
            <label>Remarks (optional):</label>
            <textarea [(ngModel)]="allocationRemarks" class="form-control" rows="3"
                      placeholder="Add any remarks about this allocation..."></textarea>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="btn btn-outline" (click)="closeDialog()">Cancel</button>
          <button class="btn btn-primary" [disabled]="!selectedAssetId" (click)="allocateAsset()">
            Allocate Asset
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .requests-container {
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-8);
    }

    .header h2 {
      margin: 0 0 var(--space-1) 0;
      color: var(--gray-900);
    }

    .header p {
      margin: 0;
      color: var(--gray-600);
    }

    .requests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: var(--space-6);
    }

    .request-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .request-card.status-pending {
      border-left: 4px solid var(--warning-500);
    }

    .request-card.status-approved {
      border-left: 4px solid var(--success-500);
    }

    .request-card.status-rejected {
      border-left: 4px solid var(--error-500);
    }

    .card-header {
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .request-info h3 {
      margin: 0 0 var(--space-1) 0;
      color: var(--gray-900);
      font-size: 1.125rem;
    }

    .request-id {
      color: var(--gray-500);
      font-size: 0.875rem;
    }

    .status-badge {
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.status-pending {
      background: var(--warning-100);
      color: var(--warning-700);
    }

    .status-badge.status-approved {
      background: var(--success-100);
      color: var(--success-700);
    }

    .status-badge.status-rejected {
      background: var(--error-100);
      color: var(--error-700);
    }

    .card-body {
      padding: var(--space-6);
    }

    .request-details {
      margin-bottom: var(--space-4);
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }

    .detail-row .label {
      color: var(--gray-600);
      font-weight: 500;
    }

    .detail-row .value {
      color: var(--gray-900);
    }

    .justification, .decision-info {
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--gray-200);
    }

    .justification h4, .decision-info h4 {
      margin: 0 0 var(--space-2) 0;
      color: var(--gray-900);
      font-size: 0.875rem;
      font-weight: 600;
    }

    .justification p, .decision-info p {
      margin: 0;
      color: var(--gray-700);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .card-actions {
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--gray-200);
      background: var(--gray-50);
      display: flex;
      gap: var(--space-2);
    }

    .btn {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      font-size: 0.875rem;
    }

    .btn-sm {
      padding: var(--space-1) var(--space-3);
      font-size: 0.75rem;
    }

    .btn-primary {
      background: var(--primary-600);
      color: white;
    }

    .btn-success {
      background: var(--success-600);
      color: white;
    }

    .btn-danger {
      background: var(--error-600);
      color: white;
    }

    .btn-outline {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
    }

    .loading, .empty-state {
      text-align: center;
      padding: var(--space-12);
      color: var(--gray-600);
    }

    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow: hidden;
    }

    .dialog-header {
      padding: var(--space-6);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dialog-header h3 {
      margin: 0;
      color: var(--gray-900);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--gray-500);
    }

    .dialog-body {
      padding: var(--space-6);
    }

    .asset-selection, .remarks-section {
      margin-bottom: var(--space-4);
    }

    .asset-selection label, .remarks-section label {
      display: block;
      font-weight: 500;
      color: var(--gray-700);
      margin-bottom: var(--space-2);
    }

    .form-control {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
    }

    .dialog-actions {
      padding: var(--space-6);
      border-top: 1px solid var(--gray-200);
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
    }
  `]
})
export class AssetRequestsListComponent implements OnInit {
  requests: AssetRequestResponse[] = [];
  availableAssets: Asset[] = [];
  loading = true;
  showDialog = false;
  selectedRequest: AssetRequestResponse | null = null;
  selectedAssetId: number | null = null;
  allocationRemarks = '';

  constructor(
    private requestService: RequestService,
    private assetService: AssetService,
    private authService: AuthService,
    private roleService: RoleService,
    private toastService: ToastService,
    private router: Router
  ) {}

  get isITSupport(): boolean {
    return this.roleService.isITSupport() || this.roleService.isAdmin();
  }

  get canCreateRequest(): boolean {
    return this.roleService.isEmployee() || !this.isITSupport;
  }

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.loading = false;
      return;
    }

    const request$ = this.isITSupport 
      ? this.requestService.list(0, 50)
      : this.requestService.myRequests(currentUser.id, 0, 50);

    request$.subscribe({
      next: (response) => {
        this.requests = response.content;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.loading = false;
      }
    });
  }

  createRequest() {
    this.router.navigate(['/asset-requests/new']);
  }

  showAllocationDialog(request: AssetRequestResponse) {
    this.selectedRequest = request;
    this.selectedAssetId = null;
    this.allocationRemarks = '';
    this.showDialog = true;
    this.loadAvailableAssets(request);
  }

  loadAvailableAssets(request: AssetRequestResponse) {
    const params: any = { status: 'AVAILABLE' };
    if (request.requestedCategory) params.category = request.requestedCategory;
    if (request.requestedType) params.type = request.requestedType;

    this.assetService.searchAssets(params, 0, 100).subscribe({
      next: (response) => {
        this.availableAssets = response.content;
      },
      error: (error) => {
        console.error('Error loading available assets:', error);
        this.availableAssets = [];
      }
    });
  }

  allocateAsset() {
    if (!this.selectedRequest || !this.selectedAssetId) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.requestService.allocateAsset(
      this.selectedRequest.id,
      this.selectedAssetId,
      currentUser.id,
      this.allocationRemarks || undefined
    ).subscribe({
      next: () => {
        this.toastService.success('Asset allocated successfully');
        this.closeDialog();
        this.loadRequests();
      },
      error: (error) => {
        console.error('Error allocating asset:', error);
        this.toastService.error('Failed to allocate asset');
      }
    });
  }

  approveRequest(request: AssetRequestResponse) {
    const remarks = prompt('Enter approval remarks (optional):');
    if (remarks === null) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.requestService.approve(request.id, currentUser.id, remarks || undefined).subscribe({
      next: () => {
        this.toastService.success('Request approved');
        this.loadRequests();
      },
      error: (error) => {
        console.error('Error approving request:', error);
        this.toastService.error('Failed to approve request');
      }
    });
  }

  rejectRequest(request: AssetRequestResponse) {
    const remarks = prompt('Enter rejection reason:');
    if (!remarks) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.requestService.reject(request.id, currentUser.id, remarks).subscribe({
      next: () => {
        this.toastService.success('Request rejected');
        this.loadRequests();
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        this.toastService.error('Failed to reject request');
      }
    });
  }

  closeDialog() {
    this.showDialog = false;
    this.selectedRequest = null;
    this.selectedAssetId = null;
    this.allocationRemarks = '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}