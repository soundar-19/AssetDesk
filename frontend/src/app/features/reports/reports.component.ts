import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../core/services/asset.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <p class="page-description">Generate and export asset reports with custom filters</p>
      </div>

      <div class="reports-grid">
        <div class="report-card">
          <div class="card-header">
            <h3>Asset Export</h3>
            <p>Export asset data with custom filters</p>
          </div>
          
          <div class="filters">
            <div class="filter-group">
              <label>Category</label>
              <select [(ngModel)]="filters.category" class="form-select">
                <option value="">All Categories</option>
                <option value="HARDWARE">Hardware</option>
                <option value="SOFTWARE">Software</option>
                <option value="ACCESSORIES">Accessories</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Status</label>
              <select [(ngModel)]="filters.status" class="form-select">
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Purchase Date From</label>
              <input type="date" [(ngModel)]="filters.dateFrom" class="form-control">
            </div>

            <div class="filter-group">
              <label>Purchase Date To</label>
              <input type="date" [(ngModel)]="filters.dateTo" class="form-control">
            </div>
          </div>

          <div class="export-actions">
            <button class="btn btn-outline" (click)="exportToCsv()" [disabled]="loading">
              📊 Export CSV
            </button>
            <button class="btn btn-primary" (click)="exportToPdf()" [disabled]="loading">
              📄 Export PDF
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Generating report...</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: var(--space-8);
    }

    .reports-grid {
      display: grid;
      gap: var(--space-6);
    }

    .report-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      margin-bottom: var(--space-6);
    }

    .card-header h3 {
      margin: 0 0 var(--space-2) 0;
      color: var(--gray-900);
    }

    .card-header p {
      margin: 0;
      color: var(--gray-600);
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .filter-group label {
      display: block;
      font-weight: 500;
      margin-bottom: var(--space-2);
      color: var(--gray-700);
    }

    .form-select, .form-control {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .export-actions {
      display: flex;
      gap: var(--space-3);
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      z-index: 1000;
    }

    .loading-spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-4);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ReportsComponent implements OnInit {
  loading = false;
  
  filters = {
    category: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  };

  constructor(
    private assetService: AssetService,
    private toastService: ToastService
  ) {}

  ngOnInit() {}

  exportToCsv() {
    this.loading = true;
    this.assetService.exportToCsv().subscribe({
      next: (blob) => {
        this.downloadFile(blob, this.getFileName('csv'), 'text/csv');
        this.toastService.success('Assets exported to CSV successfully');
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to export assets to CSV');
        this.loading = false;
      }
    });
  }

  exportToPdf() {
    this.loading = true;
    this.assetService.exportToPdf().subscribe({
      next: (blob) => {
        this.downloadFile(blob, this.getFileName('pdf'), 'application/pdf');
        this.toastService.success('Assets exported to PDF successfully');
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to export assets to PDF');
        this.loading = false;
      }
    });
  }

  private getFileName(extension: string): string {
    const date = new Date().toISOString().split('T')[0];
    let filename = `assets-report-${date}`;
    
    if (this.filters.category) filename += `-${this.filters.category.toLowerCase()}`;
    if (this.filters.status) filename += `-${this.filters.status.toLowerCase()}`;
    
    return `${filename}.${extension}`;
  }

  private downloadFile(blob: Blob, filename: string, mimeType: string) {
    const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}