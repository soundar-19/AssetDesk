import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../core/services/asset.service';
import { AllocationService } from '../../core/services/allocation.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-return-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Asset Return Requests</h1>
          <p class="page-description">
            Assets that have been requested for return
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="refreshRequests()">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Return Statistics -->
      <div class="return-stats">
        <div class="stats-grid">
          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-value">{{ getRequestCount('pending') }}</div>
              <div class="stat-label">Pending Response</div>
            </div>
          </div>
          <div class="stat-card acknowledged">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ getRequestCount('acknowledged') }}</div>
              <div class="stat-label">Ready to Return</div>
            </div>
          </div>
          <div class="stat-card total">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-value">{{ returnRequests.length }}</div>
              <div class="stat-label">Total Requests</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Section with Filters -->
      <div class="table-section">
        <!-- Filters -->
        <div class="filters-section">
          <div class="filters">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
              <option value="">All Statuses</option>
              <option value="pending">Pending Response</option>
              <option value="acknowledged">Ready to Return</option>
            </select>
            
            <input type="text" 
                   class="form-control" 
                   placeholder="Search assets..." 
                   [(ngModel)]="searchTerm"
                   (input)="onSearchChange()">
          </div>
          
          <div class="filter-actions">
            <button class="btn btn-outline btn-sm" (click)="clearFilters()" *ngIf="hasActiveFilters()">
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Requests List -->
        <div class="requests-list" *ngIf="!loading && filteredRequests.length > 0">
          <div *ngFor="let request of filteredRequests" class="request-card">
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

        <!-- Empty State -->
        <div *ngIf="!loading && filteredRequests.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No return requests found</h3>
          <p *ngIf="hasActiveFilters()">No requests match your current filters.</p>
          <p *ngIf="!hasActiveFilters()">You don't have any pending asset return requests.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading return requests...</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: var(--container-xl);
      margin: 0 auto;
      padding: var(--space-6);
      min-height: 100vh;
      box-sizing: border-box;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
      padding: var(--space-6);
      background: white;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      gap: var(--space-4);
    }
    .page-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--gray-900);
      margin: 0 0 var(--space-1) 0;
      line-height: var(--leading-tight);
    }
    .page-description {
      color: var(--gray-600);
      margin: 0;
      font-size: var(--text-sm);
      line-height: var(--leading-relaxed);
    }
    .header-actions {
      display: flex;
      gap: var(--space-3);
      align-items: center;
      flex-shrink: 0;
    }
    .return-stats {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--space-3);
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      transition: var(--transition-all);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .stat-card:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    .stat-card.pending {
      background: linear-gradient(135deg, var(--warning-25) 0%, var(--warning-50) 100%);
      border: 1px solid var(--warning-200);
    }
    .stat-card.acknowledged {
      background: linear-gradient(135deg, var(--success-25) 0%, var(--success-50) 100%);
      border: 1px solid var(--success-200);
    }
    .stat-card.total {
      background: linear-gradient(135deg, var(--primary-25) 0%, var(--primary-50) 100%);
      border: 1px solid var(--primary-200);
    }
    .stat-icon {
      font-size: var(--text-xl);
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
      border-radius: var(--radius-lg);
      backdrop-filter: blur(10px);
    }
    .stat-content {
      flex: 1;
      min-width: 0;
    }
    .stat-value {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--gray-900);
      line-height: var(--leading-tight);
      margin-bottom: var(--space-0-5);
    }
    .stat-label {
      color: var(--gray-600);
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: var(--leading-tight);
    }
    .table-section {
      background: white;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }
    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      background: var(--gray-25);
      border-bottom: 1px solid var(--gray-200);
      gap: var(--space-4);
    }
    .filters {
      display: flex;
      gap: var(--space-3);
      flex: 1;
      align-items: center;
      flex-wrap: nowrap;
    }
    .form-select, .form-control {
      flex: 1;
      min-width: 120px;
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      background: white;
      transition: var(--transition-all);
      font-family: inherit;
    }
    .form-control {
      flex: 1.5;
      min-width: 150px;
    }
    .filter-actions {
      display: flex;
      gap: var(--space-2);
      flex-shrink: 0;
    }
    .requests-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      padding: var(--space-4);
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
      transition: var(--transition-all);
    }
    .request-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
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
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      width: fit-content;
      border: 1px solid transparent;
    }
    .status-requested {
      background: var(--warning-100);
      color: var(--warning-700);
      border-color: var(--warning-200);
    }
    .status-acknowledged {
      background: var(--success-100);
      color: var(--success-700);
      border-color: var(--success-200);
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .btn {
      padding: var(--space-3) var(--space-4);
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: var(--font-medium);
      font-size: var(--text-sm);
      transition: var(--transition-all);
      text-align: center;
      white-space: nowrap;
      font-family: inherit;
      line-height: var(--leading-tight);
    }
    .btn-sm {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-xs);
    }
    .btn-primary {
      background: var(--primary-600);
      color: white;
      border-color: var(--primary-600);
      box-shadow: var(--shadow-xs);
    }
    .btn-primary:hover {
      background: var(--primary-700);
      border-color: var(--primary-700);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    .btn-success {
      background: var(--success-600);
      color: white;
      border-color: var(--success-600);
      box-shadow: var(--shadow-xs);
    }
    .btn-success:hover {
      background: var(--success-700);
      border-color: var(--success-700);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    .btn-secondary {
      background: var(--gray-100);
      color: var(--gray-700);
      border-color: var(--gray-300);
    }
    .btn-secondary:hover {
      background: var(--gray-200);
      border-color: var(--gray-400);
      transform: translateY(-1px);
    }
    .btn-outline {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
      box-shadow: var(--shadow-xs);
    }
    .btn-outline:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
      color: var(--gray-900);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    .empty-state {
      text-align: center;
      padding: var(--space-16);
      color: var(--gray-600);
      background: white;
    }
    .empty-icon {
      font-size: var(--text-5xl);
      margin-bottom: var(--space-4);
      opacity: 0.6;
    }
    .empty-state h3 {
      margin: 0 0 var(--space-2) 0;
      color: var(--gray-900);
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
    }
    .empty-state p {
      margin: 0 0 var(--space-6) 0;
      color: var(--gray-600);
      font-size: var(--text-sm);
      line-height: var(--leading-relaxed);
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
    .loading-state {
      text-align: center;
      padding: var(--space-16);
      color: var(--gray-600);
      background: white;
    }
    .loading-spinner {
      width: var(--space-8);
      height: var(--space-8);
      border: 3px solid var(--gray-200);
      border-top: 3px solid var(--primary-600);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto var(--space-4);
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 768px) {
      .page-container {
        padding: var(--space-3);
      }
      .page-header {
        flex-direction: column;
        gap: var(--space-4);
        align-items: stretch;
        padding: var(--space-4);
      }
      .header-actions {
        justify-content: stretch;
      }
      .header-actions .btn {
        flex: 1;
      }
      .filters-section {
        flex-direction: column;
        gap: var(--space-3);
        align-items: stretch;
      }
      .filters {
        flex-direction: column;
        gap: var(--space-2);
      }
      .form-select, .form-control {
        min-width: auto;
        width: 100%;
      }
      .stats-grid {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }
      .request-card {
        grid-template-columns: 1fr;
        gap: var(--space-4);
      }
      .actions {
        flex-direction: row;
        flex-wrap: wrap;
      }
    }
  `]
})
export class UserReturnRequestsComponent implements OnInit {
  loading = true;
  returnRequests: any[] = [];
  filteredRequests: any[] = [];
  currentUser: any = null;
  
  // Filters
  statusFilter = '';
  searchTerm = '';
  searchTimeout: any;

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
    this.loading = true;
    console.log('Loading return requests for user:', this.currentUser.id);
    this.allocationService.getUserReturnRequests(this.currentUser.id).subscribe({
      next: (requests) => {
        console.log('Return requests received:', requests);
        this.returnRequests = requests || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading return requests:', error);
        this.toastService.error('Failed to load return requests');
        this.returnRequests = [];
        this.filteredRequests = [];
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredRequests = this.returnRequests.filter(request => {
      // Status filter
      if (this.statusFilter) {
        const isPending = !this.isAcknowledged(request);
        const isAcknowledged = this.isAcknowledged(request);
        
        if (this.statusFilter === 'pending' && !isPending) return false;
        if (this.statusFilter === 'acknowledged' && !isAcknowledged) return false;
      }
      
      // Search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const assetName = (request.asset?.name || request.assetName || '').toLowerCase();
        const assetTag = (request.asset?.assetTag || request.assetTag || '').toLowerCase();
        const remarks = (request.returnRequestRemarks || '').toLowerCase();
        
        if (!assetName.includes(searchLower) && 
            !assetTag.includes(searchLower) && 
            !remarks.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  hasActiveFilters(): boolean {
    return !!(this.statusFilter || this.searchTerm);
  }

  clearFilters() {
    this.statusFilter = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  getRequestCount(status: string): number {
    if (status === 'pending') {
      return this.returnRequests.filter(request => !this.isAcknowledged(request)).length;
    }
    if (status === 'acknowledged') {
      return this.returnRequests.filter(request => this.isAcknowledged(request)).length;
    }
    return 0;
  }

  refreshRequests() {
    this.loadReturnRequests();
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