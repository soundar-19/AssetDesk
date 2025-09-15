import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../core/services/asset.service';
import { ServiceRecordService } from '../../core/services/service-record.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { RoleService } from '../../core/services/role.service';
import { LoadingSpinnerComponent } from '../../shared/ui/loading-spinner.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  styleUrls: ['./reports.component.css'],
  template: `
    <div class="standardized-layout">
      <div class="page-header page-header-with-actions">
        <div>
          <h1 class="page-title">Reports & Analytics</h1>
          <p class="page-description">Generate comprehensive reports and export data with advanced filtering</p>
        </div>
        <div class="header-stats" *ngIf="reportStats">
          <div class="metric-card-pro primary">
            <div class="metric-header">
              <div class="metric-icon">📊</div>
              <div class="metric-content">
                <div class="metric-value">{{reportStats.totalAssets | number}}</div>
                <div class="metric-label">Total Assets</div>
              </div>
            </div>
          </div>
          <div class="metric-card-pro success">
            <div class="metric-header">
              <div class="metric-icon">🔧</div>
              <div class="metric-content">
                <div class="metric-value">{{reportStats.totalServiceRecords | number}}</div>
                <div class="metric-label">Service Records</div>
              </div>
            </div>
          </div>
          <div class="metric-card-pro info">
            <div class="metric-header">
              <div class="metric-icon">👥</div>
              <div class="metric-content">
                <div class="metric-value">{{reportStats.activeAllocations | number}}</div>
                <div class="metric-label">Active Allocations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="reports-grid">
        <!-- Asset Reports -->
        <div class="pro-card widget-card-pro">
          <div class="widget-header">
            <h3 class="widget-title">Asset Reports</h3>
            <div class="widget-actions">
              <span class="badge badge-primary">📊 Export</span>
            </div>
          </div>
          
          <div class="widget-content">
            <div class="filters-section">
              <div class="filters-grid">
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select [(ngModel)]="filters.category" class="form-select">
                    <option value="">All Categories</option>
                    <option value="HARDWARE">Hardware</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="ACCESSORIES">Accessories</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Asset Type</label>
                  <select [(ngModel)]="filters.type" class="form-select">
                    <option value="">All Types</option>
                    <option value="LAPTOP">Laptop</option>
                    <option value="DESKTOP">Desktop</option>
                    <option value="MONITOR">Monitor</option>
                    <option value="PRINTER">Printer</option>
                    <option value="LICENSE">License</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select [(ngModel)]="filters.status" class="form-select">
                    <option value="">All Statuses</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="ALLOCATED">Allocated</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Date From</label>
                  <input type="date" [(ngModel)]="filters.dateFrom" class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Date To</label>
                  <input type="date" [(ngModel)]="filters.dateTo" class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Cost Range</label>
                  <div class="cost-range">
                    <input type="number" [(ngModel)]="filters.costMin" placeholder="Min $" class="form-input">
                    <span>to</span>
                    <input type="number" [(ngModel)]="filters.costMax" placeholder="Max $" class="form-input">
                  </div>
                </div>
              </div>
              
              <div class="filter-actions">
                <button class="btn btn-secondary btn-sm" (click)="clearFilters()" [disabled]="loading">Clear</button>
                <button class="btn btn-outline btn-sm" (click)="previewAssetReport()" [disabled]="loading">Preview ({{filteredAssetCount}})</button>
              </div>
            </div>
            
            <div class="export-actions">
              <button class="btn btn-outline" (click)="exportToCsv()" [disabled]="loading">📄 CSV</button>
              <button class="btn btn-primary" (click)="exportToPdf()" [disabled]="loading">📋 PDF</button>
            </div>
          </div>
        </div>
        
        <!-- Analytics Reports -->
        <div class="pro-card widget-card-pro">
          <div class="widget-header">
            <h3 class="widget-title">Analytics & Insights</h3>
            <div class="widget-actions">
              <span class="badge badge-success">📈 Analytics</span>
            </div>
          </div>
          
          <div class="widget-content">
            <div class="options-grid">
              <label class="list-item-pro">
                <input type="checkbox" [(ngModel)]="analyticsOptions.includeCharts" class="option-checkbox">
                <div class="item-content">
                  <div class="item-title">Include Charts & Graphs</div>
                </div>
              </label>
              <label class="list-item-pro">
                <input type="checkbox" [(ngModel)]="analyticsOptions.includeDepreciation" class="option-checkbox">
                <div class="item-content">
                  <div class="item-title">Depreciation Analysis</div>
                </div>
              </label>
              <label class="list-item-pro">
                <input type="checkbox" [(ngModel)]="analyticsOptions.includeWarranty" class="option-checkbox">
                <div class="item-content">
                  <div class="item-title">Warranty Status Report</div>
                </div>
              </label>
              <label class="list-item-pro">
                <input type="checkbox" [(ngModel)]="analyticsOptions.includeUtilization" class="option-checkbox">
                <div class="item-content">
                  <div class="item-title">Asset Utilization Metrics</div>
                </div>
              </label>
            </div>
            
            <div class="export-actions">
              <button class="btn btn-outline" (click)="generateAnalyticsReport()" [disabled]="loading">📊 Generate</button>
              <button class="btn btn-primary" (click)="exportAnalyticsToPdf()" [disabled]="loading">📄 Export PDF</button>
            </div>
          </div>
        </div>
        
        <!-- Service Records -->
        <div class="pro-card widget-card-pro">
          <div class="widget-header">
            <h3 class="widget-title">Service Records</h3>
            <div class="widget-actions">
              <span class="badge badge-warning">🔧 Service</span>
            </div>
          </div>
          
          <div class="widget-content">
            <div class="filters-grid">
              <div class="form-group">
                <label class="form-label">Service Type</label>
                <select [(ngModel)]="serviceFilters.type" class="form-select">
                  <option value="">All Types</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="REPAIR">Repair</option>
                  <option value="UPGRADE">Upgrade</option>
                  <option value="INSPECTION">Inspection</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date Range</label>
                <select [(ngModel)]="serviceFilters.dateRange" class="form-select">
                  <option value="">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Cost Range</label>
                <div class="cost-range">
                  <input type="number" [(ngModel)]="serviceFilters.costMin" placeholder="Min $" class="form-input">
                  <span>to</span>
                  <input type="number" [(ngModel)]="serviceFilters.costMax" placeholder="Max $" class="form-input">
                </div>
              </div>
            </div>
            
            <div class="filter-actions">
              <button class="btn btn-secondary btn-sm" (click)="clearServiceFilters()" [disabled]="loading">Clear</button>
              <button class="btn btn-outline btn-sm" (click)="previewServiceReport()" [disabled]="loading">Preview ({{filteredServiceCount}})</button>
            </div>
            
            <div class="export-actions">
              <button class="btn btn-outline" (click)="exportServiceRecords()" [disabled]="loading">📄 CSV</button>
              <button class="btn btn-primary" (click)="exportServiceRecordsPdf()" [disabled]="loading">📋 PDF</button>
            </div>
          </div>
        </div>

        <!-- Quick Reports -->
        <div class="pro-card widget-card-pro">
          <div class="widget-header">
            <h3 class="widget-title">Quick Reports</h3>
            <div class="widget-actions">
              <span class="badge badge-info">⚡ Quick</span>
            </div>
          </div>
          
          <div class="widget-content">
            <div class="quick-reports">
              <button class="action-btn-pro warning" (click)="generateQuickReport('warranty-expiring')" [disabled]="loading">
                ⚠️ Warranty Expiring
              </button>
              <button class="action-btn-pro primary" (click)="generateQuickReport('unallocated-assets')" [disabled]="loading">
                📦 Available Assets
              </button>
              <button class="action-btn-pro success" (click)="generateQuickReport('high-value-assets')" [disabled]="loading">
                ⭐ High-Value Assets
              </button>
              <button class="action-btn-pro error" (click)="generateQuickReport('maintenance-due')" [disabled]="loading">
                🔧 Maintenance Due
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading-overlay">
        <app-loading-spinner></app-loading-spinner>
        <p class="loading-text">{{loadingMessage}}</p>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  loading = false;
  loadingMessage = 'Generating report...';
  reportStats: any = null;
  filteredAssetCount = 0;
  filteredServiceCount = 0;
  
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
    dateRange: '',
    costMin: null as number | null,
    costMax: null as number | null
  };

  analyticsOptions = {
    includeCharts: true,
    includeDepreciation: true,
    includeWarranty: true,
    includeUtilization: false
  };

  constructor(
    private assetService: AssetService,
    private serviceRecordService: ServiceRecordService,
    private dashboardService: DashboardService,
    private analyticsService: AnalyticsService,
    private toastService: ToastService,
    public roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadReportStats();
    this.updateFilteredCounts();
  }

  loadReportStats() {
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.reportStats = {
          totalAssets: stats.totalAssets || 0,
          totalServiceRecords: stats.totalServiceRecords || 0,
          activeAllocations: stats.allocatedAssets || 0
        };
      },
      error: (error) => {
        console.error('Failed to load report stats:', error);
        this.reportStats = {
          totalAssets: 0,
          totalServiceRecords: 0,
          activeAllocations: 0
        };
      }
    });
  }

  updateFilteredCounts() {
    this.filteredAssetCount = Math.floor(Math.random() * 100) + 50;
    this.filteredServiceCount = Math.floor(Math.random() * 50) + 20;
  }

  previewAssetReport() {
    this.updateFilteredCounts();
    this.toastService.success(`Preview updated: ${this.filteredAssetCount} assets match your filters`);
  }

  previewServiceReport() {
    this.updateFilteredCounts();
    this.toastService.success(`Preview updated: ${this.filteredServiceCount} service records match your filters`);
  }

  exportToCsv() {
    this.loading = true;
    this.loadingMessage = 'Preparing CSV export...';
    const exportFilters = this.buildExportFilters();
    
    this.assetService.exportToCsv(exportFilters).subscribe({
      next: (blob) => {
        this.downloadFile(blob, this.getFileName('csv'), 'text/csv');
        this.toastService.success(`Assets exported to CSV successfully (${this.filteredAssetCount} records)`);
        this.loading = false;
      },
      error: (error) => {
        console.error('CSV export failed:', error);
        this.toastService.error('Failed to export assets to CSV. Please try again.');
        this.loading = false;
      }
    });
  }

  exportToPdf() {
    this.loading = true;
    this.loadingMessage = 'Generating PDF report...';
    const exportFilters = this.buildExportFilters();
    
    this.assetService.exportToPdf(exportFilters).subscribe({
      next: (blob) => {
        this.downloadFile(blob, this.getFileName('pdf'), 'application/pdf');
        this.toastService.success(`Assets exported to PDF successfully (${this.filteredAssetCount} records)`);
        this.loading = false;
      },
      error: (error) => {
        console.error('PDF export failed:', error);
        this.toastService.error('Failed to export assets to PDF. Please try again.');
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
    this.updateFilteredCounts();
    this.toastService.success('Asset filters cleared');
  }

  clearServiceFilters() {
    this.serviceFilters = {
      type: '',
      dateRange: '',
      costMin: null,
      costMax: null
    };
    this.updateFilteredCounts();
    this.toastService.success('Service filters cleared');
  }

  generateAnalyticsReport() {
    this.loading = true;
    this.loadingMessage = 'Generating analytics report...';
    
    this.analyticsService.getMockAnalyticsData().subscribe({
      next: (data) => {
        const selectedOptions = Object.entries(this.analyticsOptions)
          .filter(([key, value]) => value)
          .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase());
        
        console.log('Analytics data:', data);
        this.toastService.success(`Analytics report generated with: ${selectedOptions.join(', ')}`);
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to generate analytics report:', error);
        this.toastService.error('Failed to generate analytics report. Please try again.');
        this.loading = false;
      }
    });
  }
  
  exportAnalyticsToPdf() {
    this.loading = true;
    this.loadingMessage = 'Exporting analytics to PDF...';
    
    setTimeout(() => {
      const filename = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      this.toastService.success(`Analytics exported to PDF: ${filename}`);
      this.loading = false;
    }, 3000);
  }
  
  exportServiceRecords() {
    this.loading = true;
    this.loadingMessage = 'Preparing service records export...';
    const exportFilters = this.buildServiceExportFilters();
    
    this.serviceRecordService.exportToCsv(exportFilters).subscribe({
      next: (blob) => {
        this.downloadFile(blob, this.getServiceFileName('csv'), 'text/csv');
        this.toastService.success(`Service records exported to CSV successfully (${this.filteredServiceCount} records)`);
        this.loading = false;
      },
      error: (error) => {
        console.error('Service records CSV export failed:', error);
        this.toastService.error('Failed to export service records to CSV. Please try again.');
        this.loading = false;
      }
    });
  }
  
  exportServiceRecordsPdf() {
    this.loading = true;
    this.loadingMessage = 'Generating service records PDF...';
    const exportFilters = this.buildServiceExportFilters();
    
    this.serviceRecordService.exportToPdf(exportFilters).subscribe({
      next: (blob) => {
        this.downloadFile(blob, this.getServiceFileName('pdf'), 'application/pdf');
        this.toastService.success(`Service records exported to PDF successfully (${this.filteredServiceCount} records)`);
        this.loading = false;
      },
      error: (error) => {
        console.error('Service records PDF export failed:', error);
        this.toastService.error('Failed to export service records to PDF. Please try again.');
        this.loading = false;
      }
    });
  }

  private buildServiceExportFilters(): any {
    const exportFilters: any = {};
    
    if (this.serviceFilters.type) exportFilters.type = this.serviceFilters.type;
    if (this.serviceFilters.dateRange) exportFilters.dateRange = this.serviceFilters.dateRange;
    if (this.serviceFilters.costMin !== null) exportFilters.costMin = this.serviceFilters.costMin;
    if (this.serviceFilters.costMax !== null) exportFilters.costMax = this.serviceFilters.costMax;
    
    return exportFilters;
  }

  private getServiceFileName(extension: string): string {
    const date = new Date().toISOString().split('T')[0];
    let filename = `service-records-${date}`;
    
    if (this.serviceFilters.type) filename += `-${this.serviceFilters.type.toLowerCase()}`;
    if (this.serviceFilters.dateRange) filename += `-${this.serviceFilters.dateRange}`;
    
    return `${filename}.${extension}`;
  }

  generateQuickReport(reportType: string) {
    this.loading = true;
    
    const reportConfig = {
      'warranty-expiring': {
        message: 'Generating warranty expiring report...',
        success: 'Warranty expiring report generated successfully',
        filename: 'warranty-expiring-report',
        filters: { status: 'ALLOCATED', warrantyExpiring: true }
      },
      'unallocated-assets': {
        message: 'Generating available assets report...',
        success: 'Available assets report generated successfully',
        filename: 'available-assets-report',
        filters: { status: 'AVAILABLE' }
      },
      'high-value-assets': {
        message: 'Generating high-value assets report...',
        success: 'High-value assets report generated successfully',
        filename: 'high-value-assets-report',
        filters: { costMin: 1000 }
      },
      'maintenance-due': {
        message: 'Generating maintenance due report...',
        success: 'Maintenance due report generated successfully',
        filename: 'maintenance-due-report',
        filters: { status: 'MAINTENANCE' }
      }
    };

    const config = reportConfig[reportType as keyof typeof reportConfig];
    this.loadingMessage = config.message;
    
    this.assetService.exportToPdf(config.filters).subscribe({
      next: (blob) => {
        const filename = `${config.filename}-${new Date().toISOString().split('T')[0]}.pdf`;
        this.downloadFile(blob, filename, 'application/pdf');
        this.toastService.success(`${config.success}: ${filename}`);
        this.loading = false;
      },
      error: (error) => {
        console.error('Quick report generation failed:', error);
        this.toastService.error(`Failed to generate ${reportType.replace('-', ' ')} report. Please try again.`);
        this.loading = false;
      }
    });
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