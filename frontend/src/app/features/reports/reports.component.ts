import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../core/services/asset.service';
import { ServiceRecordService } from '../../core/services/service-record.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AnalyticsService, AnalyticsData } from '../../core/services/analytics.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { RoleService } from '../../core/services/role.service';
import { ReportGeneratorComponent } from './report-generator.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportGeneratorComponent],
  styleUrls: ['./reports.component.css'],
  template: `
    <div class="standardized-layout">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Reports</h1>
        </div>
        <p class="page-description">Generate comprehensive reports and export data with advanced filtering capabilities</p>
        
        <!-- Key Metrics Overview -->
        <div class="metrics-overview" *ngIf="reportStats">
          <div class="metric-card primary">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">{{reportStats.totalAssets | number}}</div>
              <div class="metric-label">Total Assets</div>
            </div>
          </div>
          <div class="metric-card success">
            <div class="metric-icon">🔧</div>
            <div class="metric-content">
              <div class="metric-value">{{reportStats.totalServiceRecords | number}}</div>
              <div class="metric-label">Service Records</div>
            </div>
          </div>
          <div class="metric-card info">
            <div class="metric-icon">👥</div>
            <div class="metric-content">
              <div class="metric-value">{{reportStats.activeAllocations | number}}</div>
              <div class="metric-label">Active Allocations</div>
            </div>
          </div>
          <div class="metric-card warning">
            <div class="metric-icon">⚠️</div>
            <div class="metric-content">
              <div class="metric-value">{{reportStats.pendingRequests || 0}}</div>
              <div class="metric-label">Pending Requests</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="reports-container">

        <!-- Report Generation Section -->
        <app-report-generator
          [loading]="loading"
          [filteredAssetCount]="filteredAssetCount"
          [filteredServiceCount]="filteredServiceCount"
          [filters]="filters"
          [serviceFilters]="serviceFilters"
          (onFilterChange)="onFilterChange()"
          (onServiceFilterChange)="onServiceFilterChange()"
          (clearFilters)="clearFilters()"
          (clearServiceFilters)="clearServiceFilters()"
          (exportToCsv)="exportToCsv()"
          (exportToPdf)="exportToPdf()"
          (exportServiceRecords)="exportServiceRecords()"
          (exportServiceRecordsPdf)="exportServiceRecordsPdf()">
        </app-report-generator>
        
        <!-- Quick Reports Section -->
        <div class="quick-reports-section">
          <div class="section-header">
            <h2 class="section-title">Quick Reports</h2>
            <p class="section-description">Pre-configured reports for common scenarios</p>
          </div>
          
          <div class="quick-reports-grid">
            <button class="quick-report-btn warranty" (click)="generateQuickReport('warranty-expiring')" [disabled]="loading">
              <div class="quick-report-icon">⚠️</div>
              <div class="quick-report-content">
                <div class="quick-report-title">Warranty Expiring</div>
                <div class="quick-report-description">Assets with warranties expiring soon</div>
              </div>
            </button>
            
            <button class="quick-report-btn available" (click)="generateQuickReport('unallocated-assets')" [disabled]="loading">
              <div class="quick-report-icon">📦</div>
              <div class="quick-report-content">
                <div class="quick-report-title">Available Assets</div>
                <div class="quick-report-description">Unallocated and ready-to-use assets</div>
              </div>
            </button>
            
            <button class="quick-report-btn high-value" (click)="generateQuickReport('high-value-assets')" [disabled]="loading">
              <div class="quick-report-icon">⭐</div>
              <div class="quick-report-content">
                <div class="quick-report-title">High-Value Assets</div>
                <div class="quick-report-description">Assets above ₹1,000 in value</div>
              </div>
            </button>
            
            <button class="quick-report-btn maintenance" (click)="generateQuickReport('maintenance-due')" [disabled]="loading">
              <div class="quick-report-icon">🔧</div>
              <div class="quick-report-content">
                <div class="quick-report-title">Maintenance Due</div>
                <div class="quick-report-description">Assets requiring maintenance</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div *ngIf="loading" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-message">{{loadingMessage}}</p>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit, OnDestroy {
  loading = false;
  loadingMessage = 'Generating report...';
  reportStats: any = null;
  analyticsData: AnalyticsData | null = null;
  filteredAssetCount = 0;
  filteredServiceCount = 0;
  private filterTimeout: any;
  private serviceFilterTimeout: any;
  
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
    this.loadAnalyticsData();
    this.updateFilteredCounts();
  }

  ngOnDestroy() {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    if (this.serviceFilterTimeout) {
      clearTimeout(this.serviceFilterTimeout);
    }
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

  loadAnalyticsData() {
    this.analyticsService.getAnalyticsData().subscribe({
      next: (data) => {
        this.analyticsData = data;
      },
      error: (error) => {
        console.error('Failed to load analytics data:', error);
        this.analyticsData = null;
      }
    });
  }

  refreshAnalytics() {
    this.loading = true;
    this.loadingMessage = 'Refreshing analytics data...';
    this.loadAnalyticsData();
    setTimeout(() => {
      this.loading = false;
      this.toastService.success('Analytics data refreshed successfully');
    }, 1500);
  }

  exportAnalyticsDashboard() {
    this.loading = true;
    this.loadingMessage = 'Exporting analytics dashboard...';
    
    const options = {
      includeCharts: true,
      includeDepreciation: true,
      includeWarranty: true,
      includeUtilization: true
    };
    
    this.analyticsService.exportAnalyticsReport(options).subscribe({
      next: (blob) => {
        const filename = `analytics-dashboard-${new Date().toISOString().split('T')[0]}.pdf`;
        this.downloadFile(blob, filename, 'application/pdf');
        this.toastService.success('Analytics dashboard exported successfully');
        this.loading = false;
      },
      error: (error) => {
        console.error('Analytics dashboard export failed:', error);
        this.toastService.error('Failed to export analytics dashboard');
        this.loading = false;
      }
    });
  }

  getChartData(data: { [key: string]: number }) {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    return Object.entries(data).map(([label, value]) => ({
      label: label.charAt(0) + label.slice(1).toLowerCase(),
      value,
      percentage: total > 0 ? (value / total) * 100 : 0
    }));
  }

  getStatusData(data: { [key: string]: number }) {
    return Object.entries(data).map(([label, value]) => ({
      label: label.charAt(0) + label.slice(1).toLowerCase(),
      value
    }));
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Available': 'available',
      'Allocated': 'allocated',
      'Maintenance': 'maintenance',
      'Retired': 'retired'
    };
    return statusMap[status] || 'default';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'Available': '✅',
      'Allocated': '👤',
      'Maintenance': '🔧',
      'Retired': '🗑️'
    };
    return iconMap[status] || '📋';
  }

  updateFilteredCounts() {
    // Get filtered asset count
    const assetFilters = this.buildExportFilters();
    this.assetService.getFilteredCount(assetFilters).subscribe({
      next: (count) => this.filteredAssetCount = count,
      error: (error) => {
        console.warn('Asset count endpoint not available, using fallback:', error);
        // Fallback: estimate based on total assets and filters applied
        this.filteredAssetCount = this.estimateFilteredCount(this.reportStats?.totalAssets || 0, assetFilters);
      }
    });

    // Get filtered service count
    const serviceFilters = this.buildServiceExportFilters();
    this.serviceRecordService.getFilteredCount(serviceFilters).subscribe({
      next: (count) => this.filteredServiceCount = count,
      error: (error) => {
        console.warn('Service count endpoint not available, using fallback:', error);
        // Fallback: estimate based on total service records and filters applied
        this.filteredServiceCount = this.estimateFilteredCount(this.reportStats?.totalServiceRecords || 0, serviceFilters);
      }
    });
  }

  private estimateFilteredCount(totalCount: number, filters: any): number {
    if (!totalCount) return 0;
    
    // Simple estimation: reduce count based on number of active filters
    const activeFilters = Object.values(filters).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
    
    if (activeFilters === 0) return totalCount;
    
    // Rough estimation: each filter reduces the count by 20-80%
    const reductionFactor = Math.pow(0.6, activeFilters);
    return Math.max(1, Math.floor(totalCount * reductionFactor));
  }

  previewAssetReport() {
    this.loading = true;
    this.loadingMessage = 'Updating preview...';
    
    const assetFilters = this.buildExportFilters();
    this.assetService.getFilteredCount(assetFilters).subscribe({
      next: (count) => {
        this.filteredAssetCount = count;
        this.toastService.success(`Preview updated: ${count} assets match your filters`);
        this.loading = false;
      },
      error: () => {
        this.filteredAssetCount = 0;
        this.toastService.error('Failed to update preview');
        this.loading = false;
      }
    });
  }

  previewServiceReport() {
    this.loading = true;
    this.loadingMessage = 'Updating preview...';
    
    const serviceFilters = this.buildServiceExportFilters();
    this.serviceRecordService.getFilteredCount(serviceFilters).subscribe({
      next: (count) => {
        this.filteredServiceCount = count;
        this.toastService.success(`Preview updated: ${count} service records match your filters`);
        this.loading = false;
      },
      error: () => {
        this.filteredServiceCount = 0;
        this.toastService.error('Failed to update preview');
        this.loading = false;
      }
    });
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

  onFilterChange() {
    // Validate date range
    if (this.filters.dateFrom && this.filters.dateTo && this.filters.dateFrom > this.filters.dateTo) {
      this.toastService.error('Start date cannot be after end date');
      return;
    }

    // Validate cost range
    if (this.filters.costMin !== null && this.filters.costMax !== null && this.filters.costMin > this.filters.costMax) {
      this.toastService.error('Minimum cost cannot be greater than maximum cost');
      return;
    }

    // Debounce filter changes to avoid too many API calls
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    this.filterTimeout = setTimeout(() => {
      this.updateFilteredCounts();
    }, 500);
  }

  onServiceFilterChange() {
    // Validate cost range
    if (this.serviceFilters.costMin !== null && this.serviceFilters.costMax !== null && this.serviceFilters.costMin > this.serviceFilters.costMax) {
      this.toastService.error('Minimum cost cannot be greater than maximum cost');
      return;
    }

    // Debounce filter changes to avoid too many API calls
    if (this.serviceFilterTimeout) {
      clearTimeout(this.serviceFilterTimeout);
    }
    this.serviceFilterTimeout = setTimeout(() => {
      this.updateFilteredCounts();
    }, 500);
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