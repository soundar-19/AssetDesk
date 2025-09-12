import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AssetService } from '../../core/services/asset.service';
import { AuthService } from '../../core/services/auth.service';
import { Asset } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-user-assets-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
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
        <app-data-table
          [data]="assets"
          [columns]="columns"
          [actions]="actions"
          [pagination]="pagination"
          (pageChange)="onPageChange($event)">
        </app-data-table>
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
  `]
})
export class UserAssetsPageComponent implements OnInit {
  loading = true;
  assets: Asset[] = [];
  pagination: any = null;
  searchTerm = '';
  searchTimeout: any;

  columns: TableColumn[] = [
    { key: 'assetTag', label: 'Asset Tag', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type' },
    { key: 'model', label: 'Model' },
    { key: 'warrantyExpiryDate', label: 'Warranty Expires', pipe: 'date' }
  ];

  actions: TableAction[] = [
    { 
      label: 'View Details', 
      icon: '👁', 
      action: (asset) => this.viewAsset(asset.id) 
    },
    { 
      label: 'Report Issue', 
      icon: '⚠', 
      action: (asset) => this.reportIssue(asset.id) 
    }
  ];

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
}