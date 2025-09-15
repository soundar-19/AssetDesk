import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AssetService } from '../../core/services/asset.service';
import { AuthService } from '../../core/services/auth.service';
import { Asset } from '../../core/models';

import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-user-assets-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <p class="page-description">Assets allocated to you</p>
        </div>
      </div>

      <!-- Search -->
      <div class="search-section">
        <input type="text" 
               class="form-control" 
               placeholder="Search my assets..." 
               [(ngModel)]="searchTerm"
               (input)="onSearchChange()">
      </div>

      <!-- Assets List -->
      <div *ngIf="!loading" class="assets-list">
        <div class="assets-grid">
          <div *ngFor="let asset of assets" class="asset-card" (click)="onAssetClick(asset)">
            <div class="asset-header">
              <div class="asset-info">
                <h3 class="asset-name">{{ asset.name }}</h3>
                <span class="asset-tag">{{ asset.assetTag }}</span>
              </div>

            </div>
            
            <div class="asset-details">
              <div class="detail-item">
                <span class="detail-label">Category</span>
                <span class="detail-value">{{ asset.category }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Type</span>
                <span class="detail-value">{{ asset.type }}</span>
              </div>
              <div class="detail-item" *ngIf="asset.model">
                <span class="detail-label">Model</span>
                <span class="detail-value">{{ asset.model }}</span>
              </div>
              <div class="detail-item" *ngIf="asset.warrantyExpiryDate">
                <span class="detail-label">Warranty</span>
                <span class="detail-value" [class.expired]="isWarrantyExpired(asset.warrantyExpiryDate)">{{ formatDate(asset.warrantyExpiryDate) }}</span>
              </div>
            </div>
            
            <div class="asset-actions">
              <button class="action-btn primary" (click)="viewAsset(asset.id); $event.stopPropagation()">
                <i class="icon">👁</i> View Details
              </button>
              <button class="action-btn warning" (click)="reportIssue(asset.id); $event.stopPropagation()">
                <i class="icon">⚠</i> Report Issue
              </button>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="pagination" *ngIf="pagination && pagination.totalPages > 1">
          <button class="pagination-btn" [disabled]="pagination.page === 0" (click)="onPageChange(pagination.page - 1)">
            ← Previous
          </button>
          <span class="pagination-info">Page {{ pagination.page + 1 }} of {{ pagination.totalPages }}</span>
          <button class="pagination-btn" [disabled]="pagination.page >= pagination.totalPages - 1" (click)="onPageChange(pagination.page + 1)">
            Next →
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && assets.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No assets assigned</h3>
        <p>You don't have any assets allocated to you yet.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading your assets...</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: var(--space-6);
    }

    .search-section {
      margin-bottom: var(--space-6);
    }

    .form-control {
      max-width: 400px;
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
    }

    .empty-state, .loading-state {
      text-align: center;
      padding: var(--space-12);
      color: var(--gray-500);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: var(--space-4);
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

    .assets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .asset-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--gray-200);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .asset-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: var(--primary-300);
    }

    .asset-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .asset-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 0.25rem 0;
    }

    .asset-tag {
      font-family: var(--font-family-mono);
      font-size: 0.875rem;
      color: var(--gray-600);
      background: var(--gray-100);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .asset-status {
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .status-available {
      background: var(--success-100);
      color: var(--success-700);
    }

    .status-allocated {
      background: var(--primary-100);
      color: var(--primary-700);
    }

    .status-maintenance {
      background: var(--warning-100);
      color: var(--warning-700);
    }

    .asset-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-value {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-900);
    }

    .detail-value.expired {
      color: var(--error-600);
      font-weight: 600;
    }

    .asset-actions {
      display: flex;
      gap: 0.75rem;
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn.primary {
      background: var(--primary-600);
      color: white;
    }

    .action-btn.primary:hover {
      background: var(--primary-700);
      transform: translateY(-1px);
    }

    .action-btn.warning {
      background: var(--warning-600);
      color: white;
    }

    .action-btn.warning:hover {
      background: var(--warning-700);
      transform: translateY(-1px);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .pagination-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--gray-300);
      background: white;
      color: var(--gray-700);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pagination-btn:hover:not(:disabled) {
      border-color: var(--primary-500);
      color: var(--primary-600);
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-info {
      color: var(--gray-600);
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .assets-grid {
        grid-template-columns: 1fr;
      }
      
      .asset-details {
        grid-template-columns: 1fr;
      }
      
      .asset-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UserAssetsPageComponent implements OnInit {
  loading = true;
  assets: Asset[] = [];
  pagination: any = null;
  searchTerm = '';
  searchTimeout: any;





  constructor(
    private assetService: AssetService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadMyAssets();
  }

  loadMyAssets(page: number = 0) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.loading = true;

    if (this.searchTerm) {
      this.assetService.searchAssets({
        name: this.searchTerm
      }, page, 10).subscribe({
        next: (response) => {
          // Filter to only show assets allocated to current user
          this.assets = response.content.filter(asset => 
            asset.status === 'ALLOCATED' && 
            asset.allocatedTo?.id === currentUser.id
          );
          this.pagination = {
            page: response.number || 0,
            totalPages: response.totalPages || 0,
            totalElements: this.assets.length
          };
          this.loading = false;
        },
        error: () => {
          this.toastService.error('Failed to load assets');
          this.loading = false;
        }
      });
    } else {
      this.assetService.getAssetsByUser(currentUser.id, page, 10).subscribe({
        next: (response) => {
          this.assets = response.content;
          this.pagination = {
            page: response.number || 0,
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0
          };
          this.loading = false;
        },
        error: () => {
          this.toastService.error('Failed to load your assets');
          this.loading = false;
        }
      });
    }
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadMyAssets(0);
    }, 300);
  }

  onPageChange(page: number) {
    this.loadMyAssets(page);
  }

  viewAsset(id: number) {
    this.router.navigate(['/assets', id]);
  }

  reportIssue(assetId: number) {
    this.router.navigate(['/assets', assetId, 'issue']);
  }

  onAssetClick = (asset: Asset) => {
    this.viewAsset(asset.id);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  isWarrantyExpired(warrantyDate: string): boolean {
    return new Date(warrantyDate) < new Date();
  }

}