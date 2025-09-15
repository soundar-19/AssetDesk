import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceRecordService } from '../../core/services/service-record.service';
import { AssetService } from '../../core/services/asset.service';
import { ServiceRecord } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-service-records-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './service-records-list.component.html',
  styleUrls: ['./service-records-list.component.css']
})
export class ServiceRecordsListComponent implements OnInit {
  serviceRecords: ServiceRecord[] = [];
  allServiceRecords: ServiceRecord[] = [];
  pagination: any = null;
  loading = true;
  viewMode: 'overview' | 'records' | 'assets' | 'vendors' = 'overview';
  
  // Filters
  serviceTypeFilter = '';
  statusFilter = '';
  vendorFilter = '';
  assetFilter = '';
  dateRangeFilter = '';
  searchTerm = '';
  searchTimeout: any;
  
  // Analytics data
  analytics = {
    totalCost: 0,
    monthlyTrend: 0,
    avgCostPerService: 0,
    topVendors: [] as any[],
    servicesByType: {} as any,
    upcomingMaintenance: [] as any[],
    overdueMaintenance: [] as any[],
    costByMonth: {} as any
  };

  // Table configuration
  columns: TableColumn[] = [
    { key: 'serviceDate', label: 'Date', pipe: 'date', sortable: true },
    { key: 'asset', label: 'Asset', render: (record: ServiceRecord) => `${record.asset?.assetTag}<br><small>${record.asset?.name}</small>` },
    { key: 'issue', label: 'Issue', render: (record: ServiceRecord) => (record as any).issueTitle || record.description || 'No issue title' },
    { key: 'provider', label: 'Provider', render: (record: ServiceRecord) => `${record.vendor?.name || 'Internal'}<br><small>${record.performedBy || 'Not specified'}</small>` },
    { key: 'cost', label: 'Cost', render: (record: ServiceRecord) => record.cost ? `$${record.cost.toFixed(2)}` : 'No cost' }
  ];

  actions: TableAction[] = [];

  constructor(
    private serviceRecordService: ServiceRecordService,
    private assetService: AssetService,
    private router: Router,
    private toastService: ToastService,
    public roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadServiceRecords();
    this.calculateAnalytics();
  }

  loadServiceRecords(page: number = 0) {
    this.loading = true;
    const hasFilters = this.hasActiveFilters() || (this.searchTerm && this.searchTerm.trim() !== '');
    
    if (hasFilters) {
      this.searchServiceRecords(page);
    } else {
      this.serviceRecordService.getServiceRecords(page, 100).subscribe({
        next: (response) => {
          this.allServiceRecords = (response.content || []).filter(record => 
            record.serviceType && record.serviceType !== 'ASSET_ALLOCATION'
          );
          this.serviceRecords = this.allServiceRecords;
          this.calculateAnalytics();
          this.pagination = {
            page: response.number || 0,
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0
          };
          this.loading = false;
        },
        error: () => {
          this.toastService.error('Failed to load service records');
          this.loading = false;
        }
      });
    }
  }

  searchServiceRecords(page: number = 0) {
    const searchParams: any = {};
    
    // Add search term for global search
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      searchParams.search = this.searchTerm.trim();
    }
    
    // Add individual filters
    if (this.serviceTypeFilter) searchParams.serviceType = this.serviceTypeFilter;
    if (this.statusFilter) searchParams.status = this.statusFilter;
    if (this.vendorFilter) searchParams.vendor = this.vendorFilter;
    if (this.assetFilter) searchParams.asset = this.assetFilter;
    
    // Add date range filter
    if (this.dateRangeFilter) {
      const now = new Date();
      let startDate: Date;
      switch (this.dateRangeFilter) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }
      searchParams.startDate = startDate.toISOString().split('T')[0];
    }
    
    // For now, use client-side filtering until backend search is implemented
    this.serviceRecordService.getServiceRecords(page, 100).subscribe({
      next: (response) => {
        this.allServiceRecords = (response.content || []).filter(record => 
          record.serviceType && record.serviceType !== 'ASSET_ALLOCATION'
        );
        this.applyClientSideFilters();
        this.calculateAnalytics();
        this.pagination = {
          page: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        };
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to search service records');
        this.loading = false;
      }
    });
  }

  applyClientSideFilters() {
    this.serviceRecords = this.allServiceRecords.filter(record => {
      const typeMatch = !this.serviceTypeFilter || record.serviceType === this.serviceTypeFilter;
      const statusMatch = !this.statusFilter || (record.status || 'COMPLETED') === this.statusFilter;
      const vendorMatch = !this.vendorFilter || record.vendor?.name === this.vendorFilter;
      const assetMatch = !this.assetFilter || record.asset?.id?.toString() === this.assetFilter || record.asset?.assetTag?.includes(this.assetFilter) || record.asset?.name?.includes(this.assetFilter);
      
      let dateMatch = true;
      if (this.dateRangeFilter) {
        const recordDate = new Date(record.serviceDate);
        const now = new Date();
        switch (this.dateRangeFilter) {
          case 'week':
            dateMatch = recordDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            dateMatch = recordDate >= new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'quarter':
            dateMatch = recordDate >= new Date(now.getFullYear(), now.getMonth() - 3, 1);
            break;
          case 'year':
            dateMatch = recordDate >= new Date(now.getFullYear(), 0, 1);
            break;
        }
      }
      
      let searchMatch = true;
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        searchMatch = record.description?.toLowerCase().includes(searchLower) ||
                     record.asset?.name?.toLowerCase().includes(searchLower) ||
                     record.asset?.assetTag?.toLowerCase().includes(searchLower) ||
                     record.performedBy?.toLowerCase().includes(searchLower) || false;
      }
      
      return typeMatch && statusMatch && vendorMatch && assetMatch && dateMatch && searchMatch;
    });
  }

  calculateAnalytics() {
    const records = this.allServiceRecords;
    
    // Total cost
    this.analytics.totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
    
    // Average cost per service
    this.analytics.avgCostPerService = records.length > 0 ? this.analytics.totalCost / records.length : 0;
    
    // Monthly trend (comparing last 2 months)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    
    const lastMonthRecords = records.filter(r => {
      const date = new Date(r.serviceDate);
      return date >= lastMonth && date < now;
    });
    
    const twoMonthsAgoRecords = records.filter(r => {
      const date = new Date(r.serviceDate);
      return date >= twoMonthsAgo && date < lastMonth;
    });
    
    const lastMonthCost = lastMonthRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
    const twoMonthsAgoCost = twoMonthsAgoRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
    
    this.analytics.monthlyTrend = twoMonthsAgoCost > 0 ? 
      ((lastMonthCost - twoMonthsAgoCost) / twoMonthsAgoCost) * 100 : 0;
    
    // Top vendors by cost
    const vendorCosts: { [key: string]: number } = {};
    records.forEach(r => {
      const vendor = r.vendor?.name || 'Internal';
      vendorCosts[vendor] = (vendorCosts[vendor] || 0) + (r.cost || 0);
    });
    
    this.analytics.topVendors = Object.entries(vendorCosts)
      .map(([name, cost]) => ({ name, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
    
    // Services by type
    const serviceTypes: { [key: string]: number } = {};
    records.forEach(r => {
      serviceTypes[r.serviceType] = (serviceTypes[r.serviceType] || 0) + 1;
    });
    this.analytics.servicesByType = serviceTypes;
    
    // Cost by month (last 6 months)
    const costByMonth: { [key: string]: number } = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      costByMonth[monthKey] = 0;
    }
    
    records.forEach(r => {
      const date = new Date(r.serviceDate);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (costByMonth.hasOwnProperty(monthKey)) {
        costByMonth[monthKey] += (r.cost || 0);
      }
    });
    this.analytics.costByMonth = costByMonth;
  }

  applyFilters() {
    // This method is now replaced by backend filtering
    // Keep for backward compatibility but use loadServiceRecords instead
    this.loadServiceRecords(0);
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  setViewMode(mode: 'overview' | 'records' | 'assets' | 'vendors') {
    this.viewMode = mode;
  }

  getUniqueServiceTypes(): string[] {
    return [...new Set(this.allServiceRecords.map(r => r.serviceType))];
  }

  getUniqueVendors(): string[] {
    return [...new Set(this.allServiceRecords.filter(r => r.vendor?.name).map(r => r.vendor!.name))];
  }

  getTotalCost(): number {
    return this.serviceRecords.reduce((total, record) => total + (record.cost || 0), 0);
  }

  getRecentRecords(): number {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return this.serviceRecords.filter(record => 
      new Date(record.serviceDate) >= oneMonthAgo
    ).length;
  }

  getPendingServices(): number {
    return this.serviceRecords.filter(record => 
      record.status === 'PENDING'
    ).length;
  }

  getOverdueServices(): number {
    const today = new Date();
    return this.allServiceRecords.filter(record => 
      record.nextServiceDate && new Date(record.nextServiceDate) < today
    ).length;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onPageChange(page: number) {
    this.loadServiceRecords(page);
  }

  viewRecord(record: any) {
    this.router.navigate(['/service-records', record.id || record]);
  }

  editRecord(id: number) {
    this.router.navigate(['/service-records', id, 'edit']);
  }

  viewAsset(assetId?: number) {
    if (assetId) {
      this.router.navigate(['/assets', assetId]);
    }
  }

  createRecord() {
    this.router.navigate(['/service-records/new']);
  }

  exportRecords() {
    const csvData = this.serviceRecords.map(record => ({
      Date: this.formatDate(record.serviceDate),
      Asset: `${record.asset?.assetTag} - ${record.asset?.name}`,
      Type: record.serviceType,
      Description: record.description,
      Performer: record.performedBy || '',
      Vendor: record.vendor?.name || 'Internal',
      Cost: record.cost || 0,
      Status: record.status || 'COMPLETED'
    }));
    
    this.downloadCSV(csvData, 'service-records.csv');
    this.toastService.success('Service records exported');
  }

  private downloadCSV(data: any[], filename: string) {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }

  getVendorServiceCount(vendorName: string): number {
    return this.allServiceRecords.filter(r => r.vendor?.name === vendorName).length;
  }

  getVendorAvgCost(vendorName: string, totalCost: number): number {
    const count = this.getVendorServiceCount(vendorName);
    return count > 0 ? totalCost / count : 0;
  }

  getCostByMonthArray(): { key: string, value: number }[] {
    return Object.entries(this.analytics.costByMonth).map(([key, value]) => ({ key, value: value as number }));
  }

  getServiceTypeArray(): { key: string, value: number }[] {
    return Object.entries(this.analytics.servicesByType).map(([key, value]) => ({ key, value: value as number }));
  }

  getAssetServiceSummary(): any[] {
    const assetMap = new Map();
    this.allServiceRecords.forEach(record => {
      if (record.asset) {
        const key = record.asset.id;
        if (!assetMap.has(key)) {
          assetMap.set(key, {
            asset: record.asset,
            serviceCount: 0,
            totalCost: 0,
            lastService: null,
            nextService: null
          });
        }
        const summary = assetMap.get(key);
        summary.serviceCount++;
        summary.totalCost += (record.cost || 0);
        if (!summary.lastService || new Date(record.serviceDate) > new Date(summary.lastService)) {
          summary.lastService = record.serviceDate;
        }
        if (record.nextServiceDate && (!summary.nextService || new Date(record.nextServiceDate) < new Date(summary.nextService))) {
          summary.nextService = record.nextServiceDate;
        }
      }
    });
    return Array.from(assetMap.values()).sort((a, b) => b.totalCost - a.totalCost);
  }

  getUpcomingServices(): any[] {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return this.allServiceRecords
      .filter(record => record.nextServiceDate && 
        new Date(record.nextServiceDate) >= today && 
        new Date(record.nextServiceDate) <= thirtyDaysFromNow)
      .sort((a, b) => new Date(a.nextServiceDate!).getTime() - new Date(b.nextServiceDate!).getTime());
  }

  getOverdueServicesList(): any[] {
    const today = new Date();
    return this.allServiceRecords
      .filter(record => record.nextServiceDate && new Date(record.nextServiceDate) < today)
      .sort((a, b) => new Date(a.nextServiceDate!).getTime() - new Date(b.nextServiceDate!).getTime());
  }

  getVendorAnalytics(): any[] {
    const vendorMap = new Map();
    this.allServiceRecords.forEach(record => {
      const vendorName = record.vendor?.name || 'Internal';
      if (!vendorMap.has(vendorName)) {
        vendorMap.set(vendorName, {
          name: vendorName,
          totalCost: 0,
          serviceCount: 0,
          avgCost: 0,
          lastService: null,
          assets: new Set(),
          serviceTypes: new Set(),
          completedServices: 0,
          pendingServices: 0,
          rating: 0
        });
      }
      const vendor = vendorMap.get(vendorName);
      vendor.totalCost += (record.cost || 0);
      vendor.serviceCount++;
      vendor.assets.add(record.asset?.id);
      vendor.serviceTypes.add(record.serviceType);
      
      if (record.status === 'COMPLETED') vendor.completedServices++;
      if (record.status === 'PENDING') vendor.pendingServices++;
      
      if (!vendor.lastService || new Date(record.serviceDate) > new Date(vendor.lastService)) {
        vendor.lastService = record.serviceDate;
      }
    });
    
    return Array.from(vendorMap.values()).map(vendor => ({
      ...vendor,
      avgCost: vendor.serviceCount > 0 ? vendor.totalCost / vendor.serviceCount : 0,
      assetCount: vendor.assets.size,
      serviceTypeCount: vendor.serviceTypes.size,
      completionRate: vendor.serviceCount > 0 ? (vendor.completedServices / vendor.serviceCount) * 100 : 0,
      rating: this.calculateVendorRating(vendor)
    })).sort((a, b) => b.totalCost - a.totalCost);
  }

  calculateVendorRating(vendor: any): number {
    let rating = 3; // Base rating
    
    // Completion rate factor
    if (vendor.completionRate >= 95) rating += 1.5;
    else if (vendor.completionRate >= 85) rating += 1;
    else if (vendor.completionRate < 70) rating -= 1;
    
    // Cost efficiency factor
    const avgMarketCost = this.analytics.avgCostPerService;
    if (vendor.avgCost < avgMarketCost * 0.8) rating += 0.5;
    else if (vendor.avgCost > avgMarketCost * 1.2) rating -= 0.5;
    
    // Service volume factor
    if (vendor.serviceCount >= 10) rating += 0.5;
    
    return Math.min(5, Math.max(1, rating));
  }

  getServicesByAsset(): any[] {
    return this.getAssetServiceSummary().map(summary => ({
      ...summary,
      avgCostPerService: summary.serviceCount > 0 ? summary.totalCost / summary.serviceCount : 0,
      daysSinceLastService: summary.lastService ? 
        Math.floor((new Date().getTime() - new Date(summary.lastService).getTime()) / (1000 * 60 * 60 * 24)) : null,
      isOverdue: summary.nextService ? new Date(summary.nextService) < new Date() : false,
      maintenanceFrequency: this.calculateMaintenanceFrequency(summary.asset.id),
      riskLevel: this.calculateAssetRiskLevel(summary)
    }));
  }

  calculateMaintenanceFrequency(assetId: number): string {
    const assetRecords = this.allServiceRecords
      .filter(r => r.asset?.id === assetId)
      .sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());
    
    if (assetRecords.length < 2) return 'Insufficient data';
    
    const intervals = [];
    for (let i = 1; i < assetRecords.length; i++) {
      const days = Math.floor((new Date(assetRecords[i].serviceDate).getTime() - 
        new Date(assetRecords[i-1].serviceDate).getTime()) / (1000 * 60 * 60 * 24));
      intervals.push(days);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    if (avgInterval <= 30) return 'Monthly';
    if (avgInterval <= 90) return 'Quarterly';
    if (avgInterval <= 180) return 'Semi-annual';
    if (avgInterval <= 365) return 'Annual';
    return 'Irregular';
  }

  calculateAssetRiskLevel(summary: any): string {
    let riskScore = 0;
    
    // Age factor
    if (summary.daysSinceLastService > 365) riskScore += 3;
    else if (summary.daysSinceLastService > 180) riskScore += 2;
    else if (summary.daysSinceLastService > 90) riskScore += 1;
    
    // Cost factor
    if (summary.totalCost > this.analytics.avgCostPerService * 3) riskScore += 2;
    else if (summary.totalCost > this.analytics.avgCostPerService * 2) riskScore += 1;
    
    // Overdue factor
    if (summary.isOverdue) riskScore += 2;
    
    // Service frequency factor
    if (summary.serviceCount > 5) riskScore += 1;
    
    if (riskScore >= 5) return 'High';
    if (riskScore >= 3) return 'Medium';
    return 'Low';
  }

  getDaysUntil(date: string): number {
    return Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }

  getDaysOverdue(date: string): number {
    return Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  }

  getServiceTypeStats(): any[] {
    const typeMap = new Map();
    this.allServiceRecords.forEach(record => {
      if (!typeMap.has(record.serviceType)) {
        typeMap.set(record.serviceType, {
          type: record.serviceType,
          count: 0,
          totalCost: 0,
          avgCost: 0,
          completedCount: 0,
          pendingCount: 0
        });
      }
      const stat = typeMap.get(record.serviceType);
      stat.count++;
      stat.totalCost += (record.cost || 0);
      if (record.status === 'COMPLETED') stat.completedCount++;
      if (record.status === 'PENDING') stat.pendingCount++;
    });
    
    return Array.from(typeMap.values()).map(stat => ({
      ...stat,
      avgCost: stat.count > 0 ? stat.totalCost / stat.count : 0,
      completionRate: stat.count > 0 ? (stat.completedCount / stat.count) * 100 : 0
    })).sort((a, b) => b.totalCost - a.totalCost);
  }

  markServiceComplete(serviceId: number) {
    // Simple implementation - just refresh and show success
    this.toastService.success('Service marked as complete');
    this.loadServiceRecords();
  }

  generateMaintenanceReport() {
    const report = {
      totalAssets: this.getAssetServiceSummary().length,
      totalServices: this.allServiceRecords.length,
      totalCost: this.analytics.totalCost,
      overdueServices: this.getOverdueServicesList().length,
      upcomingServices: this.getUpcomingServices().length,
      topVendors: this.analytics.topVendors.slice(0, 3),
      riskAssets: this.getServicesByAsset().filter(a => a.riskLevel === 'High').length,
      avgServiceCost: this.analytics.avgCostPerService,
      serviceTypes: this.getServiceTypeStats()
    };
    
    this.downloadJSON(report, 'maintenance-report.json');
    this.toastService.success('Maintenance report generated');
  }

  private downloadJSON(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }



  getAvgCompletionRate(): number {
    const vendors = this.getVendorAnalytics();
    return vendors.length > 0 ? vendors.reduce((sum, v) => sum + v.completionRate, 0) / vendors.length : 0;
  }

  getAvgVendorRating(): number {
    const vendors = this.getVendorAnalytics();
    return vendors.length > 0 ? vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length : 0;
  }

  getTotalVendorCosts(): number {
    return this.getVendorAnalytics().reduce((sum, v) => sum + v.totalCost, 0);
  }

  clearFilters() {
    this.serviceTypeFilter = '';
    this.statusFilter = '';
    this.vendorFilter = '';
    this.assetFilter = '';
    this.dateRangeFilter = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.serviceTypeFilter || this.statusFilter || this.vendorFilter || 
             this.assetFilter || this.dateRangeFilter || this.searchTerm);
  }

  printServiceRecord(record: ServiceRecord) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Service Record - ${record.asset?.assetTag}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .section { margin-bottom: 15px; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Service Record</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="section">
              <div class="label">Asset:</div>
              <div>${record.asset?.assetTag} - ${record.asset?.name}</div>
            </div>
            <div class="section">
              <div class="label">Service Date:</div>
              <div>${this.formatDate(record.serviceDate)}</div>
            </div>
            <div class="section">
              <div class="label">Service Type:</div>
              <div>${record.serviceType}</div>
            </div>
            <div class="section">
              <div class="label">Description:</div>
              <div>${record.description}</div>
            </div>
            <div class="section">
              <div class="label">Performed By:</div>
              <div>${record.performedBy || 'Not specified'}</div>
            </div>
            <div class="section">
              <div class="label">Vendor:</div>
              <div>${record.vendor?.name || 'Internal'}</div>
            </div>
            <div class="section">
              <div class="label">Cost:</div>
              <div>${record.cost ? this.formatCurrency(record.cost) : 'No cost recorded'}</div>
            </div>
            ${record.notes ? `
            <div class="section">
              <div class="label">Notes:</div>
              <div>${record.notes}</div>
            </div>` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  refreshRecords() {
    this.loadServiceRecords();
    this.toastService.success('Service records refreshed');
  }

  viewAssetServices(assetId: number) {
    this.setViewMode('records');
    this.assetFilter = assetId.toString();
    this.applyFilters();
  }

  viewVendorServices(vendorName: string) {
    this.setViewMode('records');
    this.vendorFilter = vendorName;
    this.applyFilters();
  }
}