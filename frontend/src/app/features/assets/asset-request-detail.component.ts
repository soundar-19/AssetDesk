import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { RequestService } from '../../core/services/request.service';
import { AssetService } from '../../core/services/asset.service';
import { RoleService } from '../../core/services/role.service';
import { AuthService } from '../../core/services/auth.service';
import { AssetRequest, Asset } from '../../core/models';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-asset-request-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container" *ngIf="request">
      <div class="page-header">
        <div>
          <h1 class="page-title">Request #{{ request.id }}</h1>
          <p class="page-description">{{ request.assetName }}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="goBack()">
            ← Back to Requests
          </button>
        </div>
      </div>

      <div class="request-content">
        <!-- Request Status Card -->
        <div class="status-card">
          <div class="status-header">
            <div class="status-info">
              <div class="status-badge" [ngClass]="getStatusClass(request.status)">
                {{ getStatusLabel(request.status) }}
              </div>
              <div class="priority-badge" [ngClass]="getPriorityClass(request.priority)">
                {{ getPriorityLabel(request.priority) }}
              </div>
            </div>
            <div class="request-actions" *ngIf="canManageRequest()">
              <button class="btn btn-success btn-sm" 
                      (click)="approveRequest()" 
                      *ngIf="request.status === 'PENDING'">
                ✅ Approve
              </button>
              <button class="btn btn-danger btn-sm" 
                      (click)="rejectRequest()" 
                      *ngIf="request.status === 'PENDING'">
                ❌ Reject
              </button>
              <button class="btn btn-primary btn-sm" 
                      (click)="fulfillRequest()" 
                      *ngIf="request.status === 'APPROVED'">
                📦 Fulfill
              </button>
            </div>
          </div>
        </div>

        <div class="details-grid">
          <!-- Request Details -->
          <div class="detail-card">
            <h3>Request Details</h3>
            <div class="detail-row">
              <label>Request Type:</label>
              <span>{{ getRequestTypeLabel(request.requestType) }}</span>
            </div>
            <div class="detail-row">
              <label>Category:</label>
              <span>{{ request.category }}</span>
            </div>
            <div class="detail-row">
              <label>Asset Type:</label>
              <span>{{ request.assetType }}</span>
            </div>
            <div class="detail-row">
              <label>Asset Name:</label>
              <span>{{ request.assetName }}</span>
            </div>
            <div class="detail-row" *ngIf="request.preferredModel">
              <label>Preferred Model:</label>
              <span>{{ request.preferredModel }}</span>
            </div>
            <div class="detail-row" *ngIf="request.estimatedCost">
              <label>Estimated Cost:</label>
              <span>{{ request.estimatedCost | currency }}</span>
            </div>
            <div class="detail-row" *ngIf="request.requiredDate">
              <label>Required By:</label>
              <span>{{ request.requiredDate | date }}</span>
            </div>
          </div>

          <!-- Requester Information -->
          <div class="detail-card">
            <h3>Requester Information</h3>
            <div class="detail-row">
              <label>Name:</label>
              <span>{{ request.requestedBy?.name || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <label>Email:</label>
              <span>{{ request.requestedBy?.email || 'N/A' }}</span>
            </div>
            <div class="detail-row" *ngIf="request.requestedBy?.department">
              <label>Department:</label>
              <span>{{ request.requestedBy.department }}</span>
            </div>
            <div class="detail-row">
              <label>Requested Date:</label>
              <span>{{ request.requestedDate | date:'medium' }}</span>
            </div>
          </div>

          <!-- Business Justification -->
          <div class="detail-card full-width">
            <h3>Business Justification</h3>
            <p class="justification-text">{{ request.businessJustification }}</p>
          </div>

          <!-- Technical Specifications -->
          <div class="detail-card full-width" *ngIf="request.specifications">
            <h3>Technical Specifications</h3>
            <p class="specifications-text">{{ request.specifications }}</p>
          </div>

          <!-- Additional Notes -->
          <div class="detail-card full-width" *ngIf="request.additionalNotes">
            <h3>Additional Notes</h3>
            <p class="notes-text">{{ request.additionalNotes }}</p>
          </div>

          <!-- Approval/Rejection Information -->
          <div class="detail-card full-width" *ngIf="request.status !== 'PENDING'">
            <h3>{{ request.status === 'APPROVED' ? 'Approval' : request.status === 'REJECTED' ? 'Rejection' : 'Fulfillment' }} Information</h3>
            
            <div class="detail-row" *ngIf="request.approvedBy">
              <label>Approved By:</label>
              <span>{{ request.approvedBy.name }}</span>
            </div>
            <div class="detail-row" *ngIf="request.approvedDate">
              <label>Approved Date:</label>
              <span>{{ request.approvedDate | date:'medium' }}</span>
            </div>
            
            <div class="detail-row" *ngIf="request.rejectedBy">
              <label>Rejected By:</label>
              <span>{{ request.rejectedBy.name }}</span>
            </div>
            <div class="detail-row" *ngIf="request.rejectedDate">
              <label>Rejected Date:</label>
              <span>{{ request.rejectedDate | date:'medium' }}</span>
            </div>
            <div class="detail-row" *ngIf="request.rejectionReason">
              <label>Rejection Reason:</label>
              <span>{{ request.rejectionReason }}</span>
            </div>
            
            <div class="detail-row" *ngIf="request.fulfilledBy">
              <label>Fulfilled By:</label>
              <span>{{ request.fulfilledBy.name }}</span>
            </div>
            <div class="detail-row" *ngIf="request.fulfilledDate">
              <label>Fulfilled Date:</label>
              <span>{{ request.fulfilledDate | date:'medium' }}</span>
            </div>
            <div class="detail-row" *ngIf="request.allocatedAsset">
              <label>Allocated Asset:</label>
              <span>{{ request.allocatedAsset.name }} ({{ request.allocatedAsset.assetTag }})</span>
            </div>
            
            <div class="detail-row" *ngIf="request.remarks">
              <label>Remarks:</label>
              <span>{{ request.remarks }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Asset Selection Modal -->
      <div class="modal-overlay" *ngIf="showAssetSelector" (click)="closeAssetSelector()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Select Asset to Fulfill Request</h3>
            <button class="close-btn" (click)="closeAssetSelector()">×</button>
          </div>
          <div class="modal-body">
            <div class="search-box">
              <input type="text" 
                     class="form-control" 
                     placeholder="Search available assets..." 
                     [(ngModel)]="assetSearchTerm"
                     (input)="searchAssets()">
            </div>
            <div class="assets-list">
              <div class="asset-item" 
                   *ngFor="let asset of availableAssets" 
                   (click)="selectAsset(asset)"
                   [class.selected]="selectedAsset?.id === asset.id">
                <div class="asset-info">
                  <div class="asset-name">{{ asset.name }}</div>
                  <div class="asset-details">{{ asset.assetTag }} - {{ asset.model }}</div>
                </div>
                <div class="asset-status">{{ asset.status }}</div>
              </div>
            </div>
            <div class="empty-state" *ngIf="availableAssets.length === 0">
              <p>No available assets found matching the criteria.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeAssetSelector()">Cancel</button>
            <button class="btn btn-primary" 
                    (click)="confirmFulfillment()" 
                    [disabled]="!selectedAsset">
              Fulfill Request
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="loading">
      <div class="loading-spinner"></div>
      <p>Loading request details...</p>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
      padding: var(--space-6);
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .status-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      padding: var(--space-6);
      margin-bottom: var(--space-6);
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-info {
      display: flex;
      gap: var(--space-3);
    }

    .status-badge, .priority-badge {
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .status-badge.pending { background: var(--warning-100); color: var(--warning-800); }
    .status-badge.approved { background: var(--success-100); color: var(--success-800); }
    .status-badge.rejected { background: var(--error-100); color: var(--error-800); }
    .status-badge.fulfilled { background: var(--primary-100); color: var(--primary-800); }
    .status-badge.cancelled { background: var(--gray-100); color: var(--gray-800); }

    .priority-badge.urgent { background: var(--error-100); color: var(--error-800); }
    .priority-badge.high { background: var(--warning-100); color: var(--warning-800); }
    .priority-badge.medium { background: var(--primary-100); color: var(--primary-800); }
    .priority-badge.low { background: var(--success-100); color: var(--success-800); }

    .request-actions {
      display: flex;
      gap: var(--space-2);
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-6);
    }

    .detail-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      padding: var(--space-6);
    }

    .detail-card.full-width {
      grid-column: 1 / -1;
    }

    .detail-card h3 {
      margin: 0 0 var(--space-4) 0;
      color: var(--gray-900);
      font-size: 1.125rem;
      font-weight: 600;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--gray-100);
    }

    .detail-row:last-child {
      margin-bottom: 0;
      border-bottom: none;
    }

    .detail-row label {
      font-weight: 500;
      color: var(--gray-600);
      min-width: 120px;
    }

    .detail-row span {
      color: var(--gray-900);
      text-align: right;
      flex: 1;
    }

    .justification-text, .specifications-text, .notes-text {
      color: var(--gray-700);
      line-height: 1.6;
      margin: 0;
      white-space: pre-wrap;
    }

    .modal-overlay {
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

    .modal-content {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-6);
      border-bottom: 1px solid var(--gray-200);
    }

    .modal-header h3 {
      margin: 0;
      color: var(--gray-900);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--gray-500);
      padding: var(--space-1);
    }

    .modal-body {
      padding: var(--space-6);
      flex: 1;
      overflow-y: auto;
    }

    .search-box {
      margin-bottom: var(--space-4);
    }

    .assets-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .asset-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-2);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .asset-item:hover {
      border-color: var(--primary-300);
      background: var(--primary-50);
    }

    .asset-item.selected {
      border-color: var(--primary-500);
      background: var(--primary-100);
    }

    .asset-name {
      font-weight: 500;
      color: var(--gray-900);
    }

    .asset-details {
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    .asset-status {
      font-size: 0.75rem;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      background: var(--success-100);
      color: var(--success-800);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-6);
      border-top: 1px solid var(--gray-200);
    }

    .btn {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
    }

    .btn-sm {
      padding: var(--space-2) var(--space-3);
      font-size: 0.75rem;
    }

    .btn-primary {
      background: var(--primary-600);
      color: white;
      border-color: var(--primary-600);
    }

    .btn-success {
      background: var(--success-600);
      color: white;
      border-color: var(--success-600);
    }

    .btn-danger {
      background: var(--error-600);
      color: white;
      border-color: var(--error-600);
    }

    .btn-secondary {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
    }

    .btn-outline {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-control {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .loading-state {
      text-align: center;
      padding: var(--space-12);
      color: var(--gray-500);
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
      .details-grid {
        grid-template-columns: 1fr;
      }

      .page-header {
        flex-direction: column;
        gap: var(--space-4);
      }

      .status-header {
        flex-direction: column;
        gap: var(--space-4);
        align-items: flex-start;
      }

      .modal-content {
        width: 95%;
        margin: var(--space-4);
      }
    }
  `]
})
export class AssetRequestDetailComponent implements OnInit {
  request: AssetRequest | null = null;
  loading = true;
  showAssetSelector = false;
  availableAssets: Asset[] = [];
  selectedAsset: Asset | null = null;
  assetSearchTerm = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private assetService: AssetService,
    public roleService: RoleService,
    private authService: AuthService,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    const requestId = this.route.snapshot.params['id'];
    if (requestId) {
      this.loadRequest(parseInt(requestId));
    }
  }

  loadRequest(id: number) {
    this.loading = true;
    this.requestService.getRequestById(id).subscribe({
      next: (request) => {
        this.request = request;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading request:', error);
        this.toastService.error('Failed to load request details');
        this.loading = false;
        this.goBack();
      }
    });
  }

  canManageRequest(): boolean {
    return this.roleService.canApproveRequests();
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pending Review',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'FULFILLED': 'Fulfilled',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  }

  getPriorityClass(priority: string): string {
    return priority.toLowerCase();
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'URGENT': 'Urgent',
      'HIGH': 'High Priority',
      'MEDIUM': 'Medium Priority',
      'LOW': 'Low Priority'
    };
    return labels[priority] || priority;
  }

  getRequestTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'NEW_ASSET': 'New Asset',
      'REPLACEMENT': 'Replacement',
      'UPGRADE': 'Upgrade',
      'ADDITIONAL': 'Additional Asset'
    };
    return labels[type] || type;
  }

  approveRequest() {
    if (!this.request) return;

    this.confirmDialog.confirm(
      'Approve Request',
      `Are you sure you want to approve the request for "${this.request.assetName}"?`
    ).subscribe(confirmed => {
      if (confirmed && this.request) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.requestService.approveRequest(this.request.id, currentUser.id).subscribe({
            next: () => {
              this.toastService.success('Request approved successfully');
              this.loadRequest(this.request!.id);
            },
            error: () => {
              this.toastService.error('Failed to approve request');
            }
          });
        }
      }
    });
  }

  rejectRequest() {
    if (!this.request) return;

    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.requestService.rejectRequest(this.request.id, currentUser.id, reason).subscribe({
          next: () => {
            this.toastService.success('Request rejected');
            this.loadRequest(this.request!.id);
          },
          error: () => {
            this.toastService.error('Failed to reject request');
          }
        });
      }
    }
  }

  fulfillRequest() {
    if (!this.request) return;
    this.loadAvailableAssets();
    this.showAssetSelector = true;
  }

  loadAvailableAssets() {
    if (!this.request) return;

    // Load available assets matching the request criteria
    const searchParams = {
      category: this.request.category,
      type: this.request.assetType,
      status: 'AVAILABLE'
    };

    this.assetService.searchAssets(searchParams, 0, 50).subscribe({
      next: (response) => {
        this.availableAssets = response.content || [];
      },
      error: (error) => {
        console.error('Error loading available assets:', error);
        this.toastService.error('Failed to load available assets');
        this.availableAssets = [];
      }
    });
  }

  searchAssets() {
    // Implement asset search functionality
    if (this.assetSearchTerm) {
      // Filter assets based on search term
      this.loadAvailableAssets();
    }
  }

  selectAsset(asset: Asset) {
    this.selectedAsset = asset;
  }

  confirmFulfillment() {
    if (!this.request || !this.selectedAsset) return;

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const remarks = prompt('Add any remarks for the fulfillment (optional):');
      
      this.requestService.fulfillRequest(
        this.request.id, 
        this.selectedAsset.id, 
        currentUser.id, 
        remarks || undefined
      ).subscribe({
        next: () => {
          this.toastService.success('Request fulfilled successfully');
          this.closeAssetSelector();
          this.loadRequest(this.request!.id);
        },
        error: () => {
          this.toastService.error('Failed to fulfill request');
        }
      });
    }
  }

  closeAssetSelector() {
    this.showAssetSelector = false;
    this.selectedAsset = null;
    this.assetSearchTerm = '';
    this.availableAssets = [];
  }

  goBack() {
    this.router.navigate(['/requests']);
  }
}