import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceRecordService } from '../../core/services/service-record.service';
import { ServiceRecord } from '../../core/models';

import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-service-records-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="service-records-container">
      <div class="header">
        <p class="subtitle">Complete log of asset maintenance and service activities</p>
      </div>

      <div class="filters-section" *ngIf="allServiceRecords.length > 0">
        <div class="filters-header">
          <h3 class="filters-title">Filter Records</h3>
        </div>
        
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">Performer</label>
            <select class="filter-select" [(ngModel)]="performerFilter" (change)="applyFilters()">
              <option value="">All Performers</option>
              <option *ngFor="let performer of getUniquePerformers()" [value]="performer">{{ performer }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Vendor</label>
            <select class="filter-select" [(ngModel)]="vendorFilter" (change)="applyFilters()">
              <option value="">All Vendors</option>
              <option *ngFor="let vendor of getUniqueVendors()" [value]="vendor">{{ vendor }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Service Type</label>
            <select class="filter-select" [(ngModel)]="serviceTypeFilter" (change)="applyFilters()">
              <option value="">All Types</option>
              <option *ngFor="let type of getUniqueServiceTypes()" [value]="type">{{ type }}</option>
            </select>
          </div>
        </div>
        
        <div class="filter-actions" *ngIf="hasActiveFilters()">
          <button class="btn-clear" (click)="clearFilters()">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
            Clear Filters
          </button>
        </div>
      </div>

      <div class="service-records-grid" *ngIf="serviceRecords.length > 0; else emptyState">
        <div 
          class="service-record-card" 
          *ngFor="let record of serviceRecords; trackBy: trackByRecord"
          (click)="viewRecord(record.id)">
          
          <div class="record-header">
            <div class="asset-info">
              <div class="asset-tag">{{ record.asset?.assetTag }}</div>
              <div class="asset-name">{{ record.asset?.name }}</div>
            </div>
            <div class="service-date">{{ formatDate(record.serviceDate) }}</div>
          </div>
          
          <div class="service-details">
            <div class="service-description">{{ record.description }}</div>
            <div class="service-cost" *ngIf="record.cost">
              {{ record.cost | currency }}
            </div>
          </div>
          
          <div class="service-meta">
            <div class="meta-item" *ngIf="record.performedBy">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
              </svg>
              {{ record.performedBy }}
            </div>
            <div class="meta-item" *ngIf="record.vendor?.name">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
              </svg>
              {{ record.vendor.name }}
            </div>
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
              </svg>
              {{ record.serviceType }}
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🔧</div>
          <h3>No service records found</h3>
          <p>{{ hasActiveFilters() ? 'No records match your current filters.' : 'No service records have been logged yet.' }}</p>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./service-records-list.component.css']
})
export class ServiceRecordsListComponent implements OnInit {
  serviceRecords: ServiceRecord[] = [];
  allServiceRecords: ServiceRecord[] = [];
  pagination: any = null;
  performerFilter = '';
  vendorFilter = '';
  serviceTypeFilter = '';
  


  constructor(
    private serviceRecordService: ServiceRecordService,
    private router: Router,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService,
    public roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadServiceRecords();
  }

  loadServiceRecords(page: number = 0) {
    this.serviceRecordService.getServiceRecords(page, 100).subscribe({
      next: (response) => {
        this.allServiceRecords = response.content;
        this.applyFilters();
        this.pagination = {
          page: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        };
      },
      error: () => {
        this.toastService.error('Failed to load service records');
      }
    });
  }

  onPageChange(page: number) {
    this.loadServiceRecords(page);
  }

  viewRecord(id: number) {
    this.router.navigate(['/service-records', id]);
  }

  getUniquePerformers(): string[] {
    return [...new Set(this.allServiceRecords.filter(r => r.performedBy).map(r => r.performedBy!))];
  }

  getUniqueVendors(): string[] {
    return [...new Set(this.allServiceRecords.filter(r => r.vendor?.name).map(r => r.vendor!.name))];
  }

  getUniqueServiceTypes(): string[] {
    return [...new Set(this.allServiceRecords.map(r => r.serviceType))];
  }

  applyFilters() {
    this.serviceRecords = this.allServiceRecords.filter(record => {
      const performerMatch = !this.performerFilter || record.performedBy === this.performerFilter;
      const vendorMatch = !this.vendorFilter || record.vendor?.name === this.vendorFilter;
      const typeMatch = !this.serviceTypeFilter || record.serviceType === this.serviceTypeFilter;
      return performerMatch && vendorMatch && typeMatch;
    });
  }

  clearFilters() {
    this.performerFilter = '';
    this.vendorFilter = '';
    this.serviceTypeFilter = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.performerFilter || this.vendorFilter || this.serviceTypeFilter);
  }

  trackByRecord(index: number, record: ServiceRecord): number {
    return record.id;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}