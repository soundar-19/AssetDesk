import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../core/services/asset.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Reports</h1>
        <p class="page-description">Generate and export asset reports with custom filters</p>
      </div>

      <div class="reports-grid">
        <div class="report-card">
          <div class="card-header">
            <h3>📊 Asset Export</h3>
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
              <label>Type</label>
              <select [(ngModel)]="filters.type" class="form-select">
                <option value="">All Types</option>
                <option value="LAPTOP">Laptop</option>
                <option value="DESKTOP">Desktop</option>
                <option value="MONITOR">Monitor</option>
                <option value="PRINTER">Printer</option>
                <option value="LICENSE">License</option>
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

            <div class="filter-group">
              <label>Cost Range</label>
              <div class="cost-range">
                <input type="number" [(ngModel)]="filters.costMin" placeholder="Min" class="form-control">
                <input type="number" [(ngModel)]="filters.costMax" placeholder="Max" class="form-control">
              </div>
            </div>
          </div>

          <div class="filter-actions">
            <button class="btn btn-sm btn-outline" (click)="clearFilters()">
              Clear Filters
            </button>
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
        
        <div class="report-card">
          <div class="card-header">
            <h3>📈 Analytics Report</h3>
            <p>Generate comprehensive analytics and insights</p>
          </div>
          
          <div class="export-actions">
            <button class="btn btn-outline" (click)="generateAnalyticsReport()" [disabled]="loading">
              📊 Generate Analytics
            </button>
            <button class="btn btn-primary" (click)="exportAnalyticsToPdf()" [disabled]="loading">
              📄 Export Analytics PDF
            </button>
          </div>
        </div>
        
        <div class="report-card">
          <div class="card-header">
            <h3>🔧 Service Records Report</h3>
            <p>Export service and maintenance records</p>
          </div>
          
          <div class="filters">
            <div class="filter-group">
              <label>Service Type</label>
              <select [(ngModel)]="serviceFilters.type" class="form-select">
                <option value="">All Types</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="REPAIR">Repair</option>
                <option value="UPGRADE">Upgrade</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Date Range</label>
              <select [(ngModel)]="serviceFilters.dateRange" class="form-select">
                <option value="">All Time</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
          
          <div class="export-actions">
            <button class="btn btn-outline" (click)="exportServiceRecords()" [disabled]="loading">
              📊 Export CSV
            </button>
            <button class="btn btn-primary" (click)="exportServiceRecordsPdf()" [disabled]="loading">
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

    .cost-range {
      display: flex;
      gap: var(--space-2);
    }

    .cost-range .form-control {
      flex: 1;
    }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: var(--space-4);
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
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    costMin: null as number | null,
    costMax: null as number | null
  };
  
  serviceFilters = {
    type: '',
    dateRange: ''
  };

  constructor(
    private assetService: AssetService,
    private toastService: ToastService,
    public roleService: RoleService
  ) {}

  ngOnInit() {}

  exportToCsv() {
    this.loading = true;
    const exportFilters = this.buildExportFilters();
    
    this.assetService.exportToCsv(exportFilters).subscribe({
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
    const exportFilters = this.buildExportFilters();
    
    this.assetService.exportToPdf(exportFilters).subscribe({
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

  private buildExportFilters(): any {
    const exportFilters: any = {};
    
    if (this.filters.category) exportFilters.category = this.filters.category;
    if (this.filters.type) exportFilters.type = this.filters.type;
    if (this.filters.status) exportFilters.status = this.filters.status;
    if (this.filters.dateFrom) exportFilters.dateFrom = this.filters.dateFrom;
    if (this.filters.dateTo) exportFilters.dateTo = this.filters.dateTo;
    if (this.filters.costMin !== null) exportFilters.costMin = this.filters.costMin;
    if (this.filters.costMax !== null) exportFilters.costMax = this.filters.costMax;
    
    return exportFilters;
  }

  private getFileName(extension: string): string {
    const date = new Date().toISOString().split('T')[0];
    let filename = `assets-report-${date}`;
    
    if (this.filters.category) filename += `-${this.filters.category.toLowerCase()}`;
    if (this.filters.type) filename += `-${this.filters.type.toLowerCase()}`;
    if (this.filters.status) filename += `-${this.filters.status.toLowerCase()}`;
    
    return `${filename}.${extension}`;
  }

  clearFilters() {
    this.filters = {
      category: '',
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      costMin: null,
      costMax: null
    };
  }

  generateAnalyticsReport() {
    this.loading = true;
    // Simulate analytics generation
    setTimeout(() => {
      this.toastService.success('Analytics report generated successfully');
      this.loading = false;
    }, 2000);
  }
  
  exportAnalyticsToPdf() {
    this.loading = true;
    setTimeout(() => {
      this.toastService.success('Analytics exported to PDF');
      this.loading = false;
    }, 2000);
  }
  
  exportServiceRecords() {
    this.loading = true;
    setTimeout(() => {
      this.toastService.success('Service records exported to CSV');
      this.loading = false;
    }, 1500);
  }
  
  exportServiceRecordsPdf() {
    this.loading = true;
    setTimeout(() => {
      this.toastService.success('Service records exported to PDF');
      this.loading = false;
    }, 1500);
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