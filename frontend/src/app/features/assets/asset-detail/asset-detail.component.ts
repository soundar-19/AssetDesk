import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../../../core/services/asset.service';
import { Asset, ServiceRecord, User, UserRole } from '../../../core/models';
import { AllocationService } from '../../../core/services/allocation.service';
import { ServiceRecordService } from '../../../core/services/service-record.service';
import { WarrantyHistoryService, WarrantyHistoryItem } from '../../../core/services/warranty-history.service';
import { IssueService } from '../../../core/services/issue.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ROLE_PERMISSIONS } from '../../../core/constants/role.constants';

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="asset-detail" *ngIf="asset">
      <div class="header">
        <div class="title-section">
          <h1>{{ asset.name }}</h1>
          <div class="asset-meta">
            <span class="asset-tag">{{ asset.assetTag }}</span>
            <span class="status" [class]="'status-' + asset.status.toLowerCase()">{{ asset.status }}</span>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" (click)="goBack()">
            <i class="icon-arrow-left"></i> Back
          </button>
          <button class="btn btn-primary" (click)="editAsset()" *ngIf="canManageAssets()">
            <i class="icon-edit"></i> Edit
          </button>
        </div>
      </div>

      <div class="content">
        <div class="main-content">
          <div class="tabs">
            <button class="tab" [class.active]="activeTab === 'overview'" (click)="setActiveTab('overview')">Overview</button>
            <button class="tab" [class.active]="activeTab === 'service'" (click)="setActiveTab('service')">Service History</button>
            <button class="tab" [class.active]="activeTab === 'issues'" (click)="setActiveTab('issues')">Issues</button>
            <button class="tab" [class.active]="activeTab === 'warranty'" (click)="setActiveTab('warranty')">Warranty</button>
          </div>

          <div class="tab-content">
            <!-- Overview Tab -->
            <div *ngIf="activeTab === 'overview'" class="tab-panel">
              <div class="info-sections">
                <div class="info-section">
                  <h3><i class="icon-info"></i> Basic Information</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Category:</label>
                      <span class="badge category">{{ asset.category }}</span>
                    </div>
                    <div class="info-item">
                      <label>Type:</label>
                      <span class="badge type">{{ asset.type }}</span>
                    </div>
                    <div class="info-item">
                      <label>Model:</label>
                      <span>{{ asset.model || 'N/A' }}</span>
                    </div>
                    <div class="info-item" *ngIf="shouldShowField('serialNumber')">
                      <label>Serial Number:</label>
                      <span class="serial">{{ asset.serialNumber || 'N/A' }}</span>
                    </div>
                    <div class="info-item" *ngIf="shouldShowField('purchaseDate')">
                      <label>Purchase Date:</label>
                      <span>{{ formatDate(asset.purchaseDate) }}</span>
                    </div>
                    <div class="info-item">
                      <label>Warranty Expiry:</label>
                      <span [class.expired]="isWarrantyExpired()">{{ formatDate(asset.warrantyExpiryDate) }}</span>
                    </div>
                    <div class="info-item" *ngIf="asset.vendor && shouldShowField('vendor')">
                      <label>Vendor:</label>
                      <span>{{ asset.vendor.name }}</span>
                    </div>
                  </div>
                </div>

                <div class="info-section" *ngIf="shouldShowFinancialInfo()">
                  <h3><i class="icon-dollar"></i> Financial Information</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Purchase Cost:</label>
                      <span class="cost">\${{ asset.cost | number:'1.2-2' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Useful Life:</label>
                      <span>{{ asset.usefulLifeYears || 'N/A' }} years</span>
                    </div>
                    <div class="info-item" *ngIf="depreciation">
                      <label>Current Value:</label>
                      <span class="cost">\${{ depreciation.currentValue | number:'1.2-2' }}</span>
                    </div>
                    <div class="info-item" *ngIf="depreciation">
                      <label>Depreciation:</label>
                      <span class="depreciation">\${{ (asset.cost - depreciation.currentValue) | number:'1.2-2' }}</span>
                    </div>
                  </div>
                  <div class="depreciation-chart" *ngIf="depreciation">
                    <div class="chart-header">
                      <span>Asset Value Over Time</span>
                      <span class="percentage">{{ getDepreciationPercentage() }}% depreciated</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress" [style.width.%]="(depreciation.currentValue / asset.cost) * 100"></div>
                    </div>
                  </div>
                </div>

                <div class="info-section" *ngIf="asset.type === 'LICENSE'">
                  <h3><i class="icon-key"></i> License Information</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Version:</label>
                      <span class="version">{{ asset.version || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Total Licenses:</label>
                      <span class="license-count">{{ asset.totalLicenses || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Used Licenses:</label>
                      <span class="license-used">{{ asset.usedLicenses || 0 }}</span>
                    </div>
                    <div class="info-item">
                      <label>Available Licenses:</label>
                      <span class="license-available">{{ (asset.totalLicenses || 0) - (asset.usedLicenses || 0) }}</span>
                    </div>
                    <div class="info-item">
                      <label>License Expiry:</label>
                      <span [class.expired]="isLicenseExpired()">{{ formatDate(asset.licenseExpiryDate) }}</span>
                    </div>
                    <div class="info-item full-width" *ngIf="asset.licenseKey && shouldShowField('licenseKey')">
                      <label>License Key:</label>
                      <div class="license-key-container">
                        <span class="license-key" [class.revealed]="showLicenseKey">{{ showLicenseKey ? asset.licenseKey : '••••••••••••••••' }}</span>
                        <button class="btn-icon" (click)="toggleLicenseKey()">
                          <i [class]="showLicenseKey ? 'icon-eye-off' : 'icon-eye'"></i>
                        </button>
                        <button class="btn-icon" (click)="copyLicenseKey()">
                          <i class="icon-copy"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="license-usage" *ngIf="asset.totalLicenses">
                    <div class="usage-header">
                      <span>License Usage</span>
                      <span>{{ asset.usedLicenses || 0 }} / {{ asset.totalLicenses }}</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress" [style.width.%]="getLicenseUsagePercentage()"></div>
                    </div>
                  </div>
                </div>

                <div class="info-section" *ngIf="currentAllocation">
                  <h3><i class="icon-user"></i> Current Allocation</h3>
                  <div class="allocation-card">
                    <div class="user-info">
                      <div class="user-name">{{ currentAllocation.user?.name }}</div>
                      <div class="user-details">{{ currentAllocation.user?.email }}</div>
                      <div class="user-department" *ngIf="currentAllocation.user?.department">{{ currentAllocation.user?.department }}</div>
                    </div>
                    <div class="allocation-details">
                      <div class="detail-item">
                        <label>Allocated Date:</label>
                        <span>{{ formatDate(currentAllocation.allocatedDate) }}</span>
                      </div>
                      <div class="detail-item" *ngIf="currentAllocation.allocationRemarks">
                        <label>Remarks:</label>
                        <span>{{ currentAllocation.allocationRemarks }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="info-section" *ngIf="groupSummary && shouldShowGroupSummary()">
                  <div class="section-title">
                    <h3><i class="icon-grid"></i> Model Summary</h3>
                    <button class="btn btn-success btn-add-asset" (click)="addAssetToGroup()" *ngIf="canManageAssets()">
                      <i class="icon-plus"></i> Add Asset
                    </button>
                  </div>
                  <div class="summary-cards">
                    <div class="summary-card">
                      <div class="card-value">{{ groupSummary.total }}</div>
                      <div class="card-label">Total</div>
                    </div>
                    <div class="summary-card available">
                      <div class="card-value">{{ groupSummary.available }}</div>
                      <div class="card-label">Available</div>
                    </div>
                    <div class="summary-card allocated">
                      <div class="card-value">{{ groupSummary.allocated }}</div>
                      <div class="card-label">Allocated</div>
                    </div>
                    <div class="summary-card maintenance">
                      <div class="card-value">{{ groupSummary.maintenance }}</div>
                      <div class="card-label">Maintenance</div>
                    </div>
                  </div>
                  <div class="allocated-users" *ngIf="groupSummary.allocatedUsers?.length">
                    <h4>Allocated Users</h4>
                    <div class="user-list">
                      <div *ngFor="let u of groupSummary.allocatedUsers" class="user-item">
                        <span class="user-name">{{ u.name }}</span>
                        <span class="user-dept">{{ u.department }}</span>
                        <span class="user-email">{{ u.email }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="actions" *ngIf="groupSummary.available > 0 && canManageAssets()">
                    <button class="btn btn-primary" (click)="quickAllocate()">
                      <i class="icon-plus"></i> Allocate Available Asset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Service History Tab -->
            <div *ngIf="activeTab === 'service'" class="tab-panel">
              <div class="section-header">
                <h3><i class="icon-tool"></i> Service History Log</h3>
                <div class="service-actions">
                  <div class="service-summary">
                    <span class="summary-item">Total Services: {{ getFilteredServiceRecords().length }}</span>
                    <span class="summary-item" *ngIf="getTotalServiceCost() > 0 && shouldShowFinancialInfo()">Total Cost: \${{ getTotalServiceCost() | number:'1.2-2' }}</span>
                  </div>
                  <button class="btn btn-primary" (click)="addServiceRecord()" *ngIf="canManageAssets()">
                    <i class="icon-plus"></i> Add Service Record
                  </button>
                </div>
              </div>
              <div class="service-filters" *ngIf="serviceRecords.length > 0">
                <div class="filter-group">
                  <label>Filter by Performer:</label>
                  <select [(ngModel)]="performerFilter" (change)="applyFilters()">
                    <option value="">All Performers</option>
                    <option *ngFor="let performer of getUniquePerformers()" [value]="performer">{{ performer }}</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>Filter by Vendor:</label>
                  <select [(ngModel)]="vendorFilter" (change)="applyFilters()">
                    <option value="">All Vendors</option>
                    <option *ngFor="let vendor of getUniqueVendors()" [value]="vendor">{{ vendor }}</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>Filter by Service Type:</label>
                  <select [(ngModel)]="serviceTypeFilter" (change)="applyFilters()">
                    <option value="">All Types</option>
                    <option *ngFor="let type of getUniqueServiceTypes()" [value]="type">{{ type }}</option>
                  </select>
                </div>
                <button class="btn-clear" (click)="clearFilters()" *ngIf="hasActiveFilters()">
                  <i class="icon-x"></i> Clear Filters
                </button>
              </div>
              <div class="service-records" *ngIf="getFilteredServiceRecords().length > 0; else noServiceRecords">
                <div *ngFor="let record of getFilteredServiceRecords(); trackBy: trackByServiceId" class="service-record-card">
                  <div class="record-header">
                    <div class="service-info">
                      <div class="service-type-badge" [class]="'type-' + (record.serviceType || 'general').toLowerCase().replace(' ', '-')">{{ record.serviceType || 'Service' }}</div>
                      <div class="service-date">{{ formatDate(record.serviceDate) }}</div>
                    </div>
                    <div class="service-status" [class]="'status-' + (record.status || 'completed').toLowerCase()">{{ record.status || 'Completed' }}</div>
                    <div class="record-actions" *ngIf="canManageAssets()">
                      <button class="btn-icon" (click)="editServiceRecord(record)" title="Edit">
                        <i class="icon-edit"></i>
                      </button>
                      <button class="btn-icon" (click)="viewServiceRecord(record)" title="View Details">
                        <i class="icon-eye"></i>
                      </button>
                    </div>
                  </div>
                  <div class="record-body">
                    <div class="description" *ngIf="record.description">
                      <strong>Description:</strong> {{ record.description }}
                    </div>
                    <div class="service-details">
                      <div class="detail-row">
                        <div class="detail-item" *ngIf="shouldShowFinancialInfo()">
                          <label>Cost:</label>
                          <span class="cost">\${{ (record.cost || 0) | number:'1.2-2' }}</span>
                        </div>
                        <div class="detail-item" *ngIf="record.vendor">
                          <label>Vendor:</label>
                          <span class="vendor">{{ record.vendor.name }}</span>
                        </div>
                        <div class="detail-item" *ngIf="record.performedBy">
                          <label>Performed By:</label>
                          <span class="performed-by">{{ record.performedBy }}</span>
                        </div>
                      </div>
                      <div class="detail-row" *ngIf="record.nextServiceDate">
                        <div class="detail-item">
                          <label>Next Service Due:</label>
                          <span class="next-service-date" [class.overdue]="isServiceOverdue(record.nextServiceDate)">{{ formatDate(record.nextServiceDate) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="service-notes" *ngIf="record.notes">
                      <strong>Notes:</strong> {{ record.notes }}
                    </div>
                  </div>
                </div>
              </div>
              <ng-template #noServiceRecords>
                <div class="empty-state">
                  <i class="icon-tool"></i>
                  <h4>No Service Records</h4>
                  <p>No service history available for this asset. Service records are automatically logged when maintenance or repairs are performed.</p>
                  <button class="btn btn-primary" (click)="addServiceRecord()" *ngIf="canManageAssets()">
                    <i class="icon-plus"></i> Add First Service Record
                  </button>
                </div>
              </ng-template>
            </div>

            <!-- Issues Tab -->
            <div *ngIf="activeTab === 'issues'" class="tab-panel">
              <div class="section-header">
                <h3><i class="icon-alert"></i> Issues</h3>
                <button class="btn btn-primary" (click)="reportIssue()" *ngIf="canCreateIssues()">
                  <i class="icon-plus"></i> Report Issue
                </button>
              </div>
              <div class="issues-list" *ngIf="recentIssues && recentIssues.length > 0; else noIssues">
                <div *ngFor="let issue of recentIssues" class="issue-card">
                  <div class="issue-header">
                    <div class="issue-title">{{ issue.title }}</div>
                    <span class="issue-status" [class]="'status-' + issue.status.toLowerCase()">{{ issue.status }}</span>
                  </div>
                  <div class="issue-meta">
                    <span class="priority" [class]="'priority-' + issue.priority?.toLowerCase()">{{ issue.priority }}</span>
                    <span class="created-date">{{ formatDate(issue.createdAt) }}</span>
                  </div>
                </div>
              </div>
              <ng-template #noIssues>
                <div class="empty-state">
                  <i class="icon-alert"></i>
                  <h4>No Issues</h4>
                  <p>No issues reported for this asset.</p>
                  <button class="btn btn-primary" (click)="reportIssue()" *ngIf="canCreateIssues()">
                    <i class="icon-plus"></i> Report First Issue
                  </button>
                </div>
              </ng-template>
            </div>

            <!-- Warranty Tab -->
            <div *ngIf="activeTab === 'warranty'" class="tab-panel">
              <div class="warranty-status">
                <h3><i class="icon-shield"></i> Warranty Status</h3>
                <div class="warranty-info">
                  <div class="warranty-card" [class.expired]="isWarrantyExpired()">
                    <div class="warranty-date">{{ formatDate(asset.warrantyExpiryDate) }}</div>
                    <div class="warranty-label">{{ isWarrantyExpired() ? 'Expired' : 'Valid Until' }}</div>
                    <div class="warranty-days" *ngIf="!isWarrantyExpired()">
                      {{ getWarrantyDaysRemaining() }} days remaining
                    </div>
                  </div>
                </div>
              </div>
              <div class="warranty-history" *ngIf="warrantyHistory && warrantyHistory.length > 0">
                <h4>Warranty History</h4>
                <div class="history-list">
                  <div *ngFor="let wh of warrantyHistory" class="history-item">
                    <div class="history-dates">
                      <span class="old-date">{{ formatDate(wh.oldExpiryDate) }}</span>
                      <i class="icon-arrow-right"></i>
                      <span class="new-date">{{ formatDate(wh.newExpiryDate) }}</span>
                    </div>
                    <div class="history-meta">
                      <span class="changed-date">{{ formatDate(wh.changedAt) }}</span>
                      <span class="reason">{{ wh.reason || 'Update' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar">
          <div class="asset-image" *ngIf="asset.imageUrl">
            <img [src]="asset.imageUrl" [alt]="asset.name">
          </div>
          
          <div class="quick-actions">
            <h4>Quick Actions</h4>
            <button class="action-btn" (click)="editAsset()" *ngIf="canManageAssets()">
              <i class="icon-edit"></i> Edit Asset
            </button>
            <button class="action-btn" (click)="reportIssue()" *ngIf="canCreateIssues()">
              <i class="icon-alert"></i> Report Issue
            </button>
            <button class="action-btn" *ngIf="!currentAllocation && asset.status === 'AVAILABLE' && canManageAssets()" (click)="allocateAsset()">
              <i class="icon-user"></i> Allocate
            </button>
            <button class="action-btn" *ngIf="currentAllocation && canManageAssets()" (click)="returnAsset()">
              <i class="icon-return"></i> Return Asset
            </button>
            <button class="action-btn" (click)="viewAssetHistory()" *ngIf="canManageAssets()">
              <i class="icon-history"></i> View History
            </button>
          </div>

          <div class="asset-stats">
            <h4>Statistics</h4>
            <div class="stat-item">
              <label>Total Issues:</label>
              <span>{{ recentIssues.length }}</span>
            </div>
            <div class="stat-item">
              <label>Service Records:</label>
              <span>{{ getFilteredServiceRecords().length }}{{ hasActiveFilters() ? ' / ' + serviceRecords.length : '' }}</span>
            </div>
            <div class="stat-item" *ngIf="depreciation && shouldShowFinancialInfo()">
              <label>Age:</label>
              <span>{{ depreciation.yearsUsed }} years</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .asset-detail { 
      padding: var(--space-6); 
      max-width: 1400px; 
      margin: 0 auto;
      background-color: var(--gray-50);
      min-height: 100vh;
    }
    
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      margin-bottom: var(--space-8); 
      padding: var(--space-6);
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }
    
    .title-section h1 { 
      margin: 0 0 var(--space-2) 0; 
      color: var(--gray-900); 
      font-size: 1.875rem; 
      font-weight: 700;
      line-height: 1.2;
    }
    
    .asset-meta { 
      display: flex; 
      gap: var(--space-4); 
      align-items: center; 
    }
    
    .asset-tag { 
      background: var(--gray-100); 
      color: var(--gray-700);
      padding: var(--space-2) var(--space-3); 
      border-radius: var(--radius-md); 
      font-family: var(--font-family-mono); 
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    .actions { 
      display: flex; 
      gap: var(--space-3); 
    }
    
    .content { 
      display: grid; 
      grid-template-columns: 1fr 320px; 
      gap: var(--space-8); 
    }
    
    .main-content { 
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }
    
    .tabs { 
      display: flex; 
      border-bottom: 1px solid var(--gray-200); 
      background: var(--gray-50);
    }
    
    .tab { 
      padding: var(--space-4) var(--space-6); 
      border: none; 
      background: none; 
      cursor: pointer; 
      font-weight: 500; 
      color: var(--gray-600); 
      border-bottom: 2px solid transparent; 
      transition: all var(--transition-fast);
      font-size: 0.875rem;
    }
    
    .tab.active { 
      color: var(--primary-600); 
      border-bottom-color: var(--primary-600);
      background: white;
    }
    
    .tab:hover:not(.active) { 
      color: var(--primary-500); 
      background: var(--gray-100); 
    }
    
    .tab-panel { 
      animation: fadeIn 0.3s ease-in;
      padding: var(--space-6);
    }
    
    @keyframes fadeIn { 
      from { opacity: 0; transform: translateY(8px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    
    .info-sections { 
      display: flex; 
      flex-direction: column; 
      gap: var(--space-6); 
    }
    
    .info-section { 
      background: var(--gray-50); 
      padding: var(--space-6); 
      border-radius: var(--radius-lg); 
      border: 1px solid var(--gray-200);
    }
    
    .info-section h3 { 
      margin: 0 0 var(--space-5) 0; 
      color: var(--gray-900); 
      font-size: 1.125rem; 
      font-weight: 600; 
      display: flex; 
      align-items: center; 
      gap: var(--space-2); 
    }
    
    .info-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
      gap: var(--space-5); 
    }
    
    .info-item { 
      display: flex; 
      flex-direction: column; 
      gap: var(--space-2);
    }
    
    .info-item.full-width { 
      grid-column: 1 / -1; 
    }
    
    .info-item label { 
      font-weight: 500; 
      color: var(--gray-600); 
      font-size: 0.75rem; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
    }
    
    .info-item span { 
      color: var(--gray-900); 
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    .badge { 
      display: inline-flex;
      align-items: center;
      padding: var(--space-1) var(--space-3); 
      border-radius: var(--radius-xl); 
      font-size: 0.75rem; 
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      width: fit-content;
    }
    
    .badge.category { 
      background: var(--primary-50); 
      color: var(--primary-600); 
    }
    
    .badge.type { 
      background: var(--gray-100); 
      color: var(--gray-700); 
    }
    
    .status { 
      display: inline-flex;
      align-items: center;
      padding: var(--space-1) var(--space-3); 
      border-radius: var(--radius-xl); 
      color: white; 
      font-size: 0.75rem; 
      font-weight: 500; 
      text-transform: uppercase;
      letter-spacing: 0.025em;
      width: fit-content;
    }
    
    .status-available { 
      background: var(--success-500); 
    }
    
    .status-allocated { 
      background: var(--primary-600); 
    }
    
    .status-maintenance { 
      background: var(--warning-500); 
    }
    
    .status-retired { 
      background: var(--gray-500); 
    }
    
    .serial { 
      font-family: var(--font-family-mono); 
      background: var(--gray-100); 
      color: var(--gray-700);
      padding: var(--space-1) var(--space-2); 
      border-radius: var(--radius-sm); 
      font-size: 0.875rem;
    }
    
    .cost { 
      font-weight: 600; 
      color: var(--success-600); 
    }
    
    .depreciation { 
      font-weight: 600; 
      color: var(--error-600); 
    }
    
    .expired { 
      color: var(--error-600); 
      font-weight: 600; 
    }
    
    .depreciation-chart, .license-usage { 
      margin-top: var(--space-5); 
      padding: var(--space-4);
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
    }
    
    .chart-header, .usage-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: var(--space-3); 
    }
    
    .percentage { 
      font-weight: 600; 
      color: var(--gray-600);
      font-size: 0.875rem;
    }
    
    .progress-bar { 
      height: 8px; 
      background: var(--gray-200); 
      border-radius: var(--radius-sm); 
      overflow: hidden; 
    }
    
    .progress { 
      height: 100%; 
      background: var(--success-500); 
      transition: width var(--transition-normal); 
    }
    
    .license-key-container { display: flex; align-items: center; gap: 0.5rem; }
    .license-key { font-family: monospace; background: #f8f9fa; padding: 0.5rem; border-radius: 0.375rem; flex: 1; }
    .license-key.revealed { background: #fff3cd; }
    .btn-icon { padding: 0.375rem; border: none; background: #f8f9fa; border-radius: 0.375rem; cursor: pointer; color: #666; }
    .btn-icon:hover { background: #e9ecef; color: #333; }
    
    .allocation-card { display: flex; gap: 1.5rem; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 0.75rem; }
    .user-info .user-name { font-weight: 600; color: #1a1a1a; }
    .user-info .user-details { color: #666; font-size: 0.875rem; }
    .user-info .user-department { color: #007bff; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; margin-top: 0.25rem; }
    .allocation-details { flex: 1; }
    .detail-item { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .detail-item label { font-weight: 500; color: #666; }
    
    .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .summary-card { text-align: center; padding: 1.5rem; background: #f8f9fa; border-radius: 0.75rem; }
    .summary-card.available { background: #d4edda; }
    .summary-card.allocated { background: #cce5ff; }
    .summary-card.maintenance { background: #fff3cd; }
    .card-value { font-size: 2rem; font-weight: 700; color: #1a1a1a; }
    .card-label { color: #666; font-weight: 500; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
    
    .user-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .user-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8f9fa; border-radius: 0.5rem; }
    .user-name { font-weight: 600; }
    .user-dept { color: #666; font-size: 0.875rem; }
    .user-email { color: #007bff; font-size: 0.875rem; }
    
    .section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .section-header h3 { margin: 0; display: flex; align-items: center; gap: 0.5rem; }
    .service-actions { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .service-summary { display: flex; gap: 2rem; color: #666; font-size: 0.875rem; }
    .summary-item { display: flex; align-items: center; gap: 0.5rem; }
    .record-actions { display: flex; gap: 0.5rem; align-items: center; }
    
    .service-record-card, .issue-card { background: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; margin-bottom: 1rem; }
    .record-header, .issue-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .service-info { display: flex; flex-direction: column; gap: 0.5rem; }
    .service-type-badge { padding: 0.375rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; text-transform: uppercase; }
    .type-maintenance { background: #fff3cd; color: #856404; }
    .type-repair { background: #f8d7da; color: #721c24; }
    .type-upgrade { background: #d4edda; color: #155724; }
    .type-inspection { background: #cce5ff; color: #004085; }
    .type-general { background: #e9ecef; color: #495057; }
    .service-date { color: #666; font-size: 0.875rem; }
    .service-status { padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; }
    .status-completed { background: #d4edda; color: #155724; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
    .service-details { margin-top: 1rem; }
    .detail-row { display: flex; gap: 2rem; margin-bottom: 0.75rem; }
    .detail-item { display: flex; flex-direction: column; min-width: 150px; }
    .detail-item label { font-weight: 500; color: #666; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
    .detail-item span { color: #1a1a1a; font-weight: 500; }
    .next-service-date.overdue { color: #dc3545; font-weight: 600; }
    .service-notes { margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; font-size: 0.875rem; }
    .service-notes strong { color: #666; }
    
    .issue-meta { display: flex; gap: 1rem; align-items: center; }
    .priority { padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; }
    .priority-high { background: #f8d7da; color: #721c24; }
    .priority-medium { background: #fff3cd; color: #856404; }
    .priority-low { background: #d4edda; color: #155724; }
    .created-date { color: #666; font-size: 0.875rem; }
    
    .warranty-card { text-align: center; padding: 2rem; background: #d4edda; border-radius: 1rem; }
    .warranty-card.expired { background: #f8d7da; }
    .warranty-date { font-size: 1.5rem; font-weight: 700; color: #1a1a1a; }
    .warranty-label { color: #666; margin-top: 0.5rem; }
    .warranty-days { color: #28a745; font-weight: 600; margin-top: 0.5rem; }
    
    .history-list { display: flex; flex-direction: column; gap: 1rem; }
    .history-item { padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; }
    .history-dates { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
    .history-meta { display: flex; justify-content: space-between; margin-top: 0.5rem; color: #666; font-size: 0.875rem; }
    
    .sidebar { 
      display: flex; 
      flex-direction: column; 
      gap: var(--space-6); 
    }
    
    .asset-image img { 
      width: 100%; 
      border-radius: var(--radius-lg); 
      box-shadow: var(--shadow-md);
    }
    
    .quick-actions, .asset-stats { 
      background: white; 
      padding: var(--space-6); 
      border-radius: var(--radius-lg); 
      box-shadow: var(--shadow-sm); 
      border: 1px solid var(--gray-200); 
    }
    
    .quick-actions h4, .asset-stats h4 { 
      margin: 0 0 var(--space-4) 0; 
      color: var(--gray-900); 
      font-weight: 600;
      font-size: 1rem;
    }
    
    .action-btn { 
      width: 100%; 
      padding: var(--space-3); 
      border: none; 
      background: var(--gray-50); 
      border-radius: var(--radius-md); 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      gap: var(--space-2); 
      margin-bottom: var(--space-2); 
      transition: all var(--transition-fast);
      color: var(--gray-700);
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    .action-btn:hover { 
      background: var(--gray-100); 
      transform: translateX(2px); 
      color: var(--gray-900);
    }
    
    .stat-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0; }
    .stat-item:last-child { border-bottom: none; }
    .stat-item label { color: #666; }
    .stat-item span { font-weight: 600; }
    
    .empty-state { text-align: center; padding: 3rem; color: #666; }
    .empty-state i { font-size: 3rem; margin-bottom: 1rem; color: #ccc; }
    .empty-state h4 { margin: 0 0 0.5rem 0; color: #1a1a1a; }
    .empty-state p { 
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .service-filters { display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; flex-wrap: wrap; }
    .filter-group { display: flex; flex-direction: column; min-width: 150px; }
    .filter-group label { font-size: 0.75rem; font-weight: 500; color: #666; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .filter-group select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 0.375rem; background: white; font-size: 0.875rem; }
    .btn-clear { padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; }
    .btn-clear:hover { background: #c82333; }
    .section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .section-title h3 { margin: 0; }
    .btn-add-asset { padding: 0.5rem 1rem; font-size: 0.875rem; }
    .btn-success { background: linear-gradient(135deg, #28a745, #20c997); color: white; }
    .btn-success:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(40,167,69,0.3); }
    
    @media (max-width: 1024px) {
      .content {
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }
      
      .sidebar {
        order: -1;
      }
    }
    
    @media (max-width: 640px) {
      .asset-detail {
        padding: var(--space-4);
      }
      
      .header {
        flex-direction: column;
        gap: var(--space-4);
        align-items: stretch;
      }
      
      .actions {
        justify-content: stretch;
      }
      
      .actions .btn {
        flex: 1;
        justify-content: center;
      }
      
      .tabs {
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      
      .tabs::-webkit-scrollbar {
        display: none;
      }
      
      .tab {
        white-space: nowrap;
        min-width: fit-content;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .service-filters {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filter-group {
        min-width: auto;
      }
    }
  `]
})
export class AssetDetailComponent implements OnInit {
  asset: Asset | null = null;
  currentAllocation: any = null;
  recentIssues: any[] = [];
  serviceRecords: ServiceRecord[] = [];
  depreciation: any = null;
  warrantyHistory: WarrantyHistoryItem[] = [];
  groupSummary: any = null;
  activeTab = 'overview';
  showLicenseKey = false;
  performerFilter = '';
  vendorFilter = '';
  serviceTypeFilter = '';
  filteredServiceRecords: ServiceRecord[] = [];
  currentUser: User | null = null;
  userRole: UserRole | null = null;
  permissions: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assetService: AssetService,
    private allocationService: AllocationService,
    private serviceRecordService: ServiceRecordService,
    private issueService: IssueService,
    private warrantyHistoryService: WarrantyHistoryService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.initializeUserContext();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(+id)) {
      this.loadAsset(+id);
    } else {
      this.toastService.error('Invalid asset ID');
      this.router.navigate(['/assets']);
    }
  }

  private initializeUserContext() {
    this.currentUser = this.authService.getCurrentUser();
    this.userRole = this.currentUser?.role || null;
    this.permissions = this.userRole ? ROLE_PERMISSIONS[this.userRole] : {};
  }

  loadAsset(id: number) {
    if (!id || isNaN(id)) {
      this.toastService.error('Invalid asset ID');
      this.router.navigate(['/assets']);
      return;
    }
    
    this.assetService.getAssetById(id).subscribe({
      next: (asset) => {
        this.asset = asset;
        this.loadAssetData(id);
      },
      error: (error) => {
        console.error('Error loading asset:', error);
        this.toastService.error('Asset not found or access denied');
        this.router.navigate(['/assets']);
      }
    });
  }

  private loadAssetData(id: number) {
    // Load data based on user permissions
    this.loadCurrentAllocation(id);
    this.loadRecentIssues(id);
    this.loadServiceRecords(id);
    
    // Only load financial data for authorized roles
    if (this.permissions.canManageAssets || this.permissions.canManageSystem) {
      this.loadDepreciation(id);
    }
    
    // Load warranty history for all users
    this.loadWarrantyHistory(id);
    
    // Load group summary for asset managers
    if (this.permissions.canManageAssets) {
      this.loadGroupSummary();
    }
  }

  loadWarrantyHistory(assetId: number) {
    this.warrantyHistoryService.listByAsset(assetId).subscribe({
      next: (items) => this.warrantyHistory = items || []
    });
  }

  loadServiceRecords(assetId: number) {
    this.serviceRecordService.getServiceRecordsByAsset(assetId).subscribe({
      next: (response) => {
        this.serviceRecords = response || [];
        this.filteredServiceRecords = [...this.serviceRecords];
      },
      error: (error) => {
        console.error('Error loading service records:', error);
        this.serviceRecords = [];
        this.filteredServiceRecords = [];
      }
    });
  }

  loadDepreciation(assetId: number) {
    this.assetService.getDepreciation(assetId).subscribe({
      next: (data) => {
        this.depreciation = data;
      }
    });
  }

  loadCurrentAllocation(assetId: number) {
    this.allocationService.getCurrentAllocationByAsset(assetId).subscribe({
      next: (allocation) => {
        this.currentAllocation = allocation;
      },
      error: () => {
        // No current allocation
      }
    });
  }

  loadRecentIssues(assetId: number) {
    this.issueService.getIssuesByAsset(assetId, 0, 5).subscribe({
      next: (response) => {
        this.recentIssues = response?.content || [];
      },
      error: (error) => {
        console.error('Error loading issues:', error);
        this.recentIssues = [];
      }
    });
  }

  loadGroupSummary() {
    if (!this.asset?.name) return;
    this.assetService.getGroupSummary(this.asset.name).subscribe({
      next: (data) => this.groupSummary = data
    });
  }

  editAsset() {
    if (!this.canManageAssets()) {
      this.toastService.error('Access denied');
      return;
    }
    this.router.navigate(['/assets', this.asset?.id, 'edit']);
  }

  goBack() {
    this.router.navigate(['/assets']);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  isWarrantyExpired(): boolean {
    if (!this.asset?.warrantyExpiryDate) return false;
    return new Date(this.asset.warrantyExpiryDate) < new Date();
  }

  isLicenseExpired(): boolean {
    if (!this.asset?.licenseExpiryDate) return false;
    return new Date(this.asset.licenseExpiryDate) < new Date();
  }

  getWarrantyDaysRemaining(): number {
    if (!this.asset?.warrantyExpiryDate) return 0;
    const expiry = new Date(this.asset.warrantyExpiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDepreciationPercentage(): number {
    if (!this.depreciation || !this.asset) return 0;
    const depreciated = this.asset.cost - this.depreciation.currentValue;
    return Math.round((depreciated / this.asset.cost) * 100);
  }

  getLicenseUsagePercentage(): number {
    if (!this.asset?.totalLicenses) return 0;
    return Math.round(((this.asset.usedLicenses || 0) / this.asset.totalLicenses) * 100);
  }

  toggleLicenseKey() {
    this.showLicenseKey = !this.showLicenseKey;
  }

  copyLicenseKey() {
    if (this.asset?.licenseKey) {
      navigator.clipboard.writeText(this.asset.licenseKey);
      this.toastService.success('License key copied to clipboard');
    }
  }

  reportIssue() {
    if (!this.canCreateIssues()) {
      this.toastService.error('Access denied');
      return;
    }
    this.router.navigate(['/issues/new'], { queryParams: { assetId: this.asset?.id } });
  }

  isServiceOverdue(nextServiceDate: string | null | undefined): boolean {
    if (!nextServiceDate) return false;
    return new Date(nextServiceDate) < new Date();
  }

  trackByServiceId(index: number, record: ServiceRecord): number {
    return record.id;
  }

  getFilteredServiceRecords(): ServiceRecord[] {
    return this.filteredServiceRecords || [];
  }

  getUniquePerformers(): string[] {
    return [...new Set((this.serviceRecords || []).filter(r => r.performedBy).map(r => r.performedBy!))];
  }

  getUniqueVendors(): string[] {
    return [...new Set((this.serviceRecords || []).filter(r => r.vendor?.name).map(r => r.vendor!.name))];
  }

  getUniqueServiceTypes(): string[] {
    return [...new Set((this.serviceRecords || []).map(r => r.serviceType))];
  }

  applyFilters() {
    this.filteredServiceRecords = (this.serviceRecords || []).filter(record => {
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
    this.filteredServiceRecords = [...(this.serviceRecords || [])];
  }

  hasActiveFilters(): boolean {
    return !!(this.performerFilter || this.vendorFilter || this.serviceTypeFilter);
  }

  addAssetToGroup() {
    if (!this.asset) return;
    
    const preloadData = {
      name: this.asset.name,
      category: this.asset.category,
      type: this.asset.type,
      model: this.asset.model,
      cost: this.asset.cost,
      usefulLifeYears: this.asset.usefulLifeYears,
      vendorId: this.asset.vendor?.id,
      // License specific fields
      ...(this.asset.type === 'LICENSE' && {
        version: this.asset.version,
        totalLicenses: this.asset.totalLicenses,
        licenseExpiryDate: this.asset.licenseExpiryDate
      })
    };
    
    this.router.navigate(['/assets/new'], { 
      queryParams: { preload: JSON.stringify(preloadData) }
    });
  }

  allocateAsset() {
    if (!this.canManageAssets()) {
      this.toastService.error('Access denied');
      return;
    }
    this.router.navigate(['/allocations/new'], { queryParams: { assetId: this.asset?.id } });
  }

  quickAllocate() {
    if (!this.canManageAssets()) {
      this.toastService.error('Access denied');
      return;
    }
    
    const userIdStr = prompt('Enter user ID to allocate an available asset from this model:');
    if (!userIdStr) return;
    const userId = Number(userIdStr);
    if (isNaN(userId)) {
      this.toastService.error('Invalid user ID');
      return;
    }
    const remarks = `Quick allocated from group ${this.asset?.name}`;
    this.assetService.allocateFromGroup(this.asset!.name, userId, remarks).subscribe({
      next: () => {
        this.toastService.success('Asset allocated');
        this.loadAsset(this.asset!.id);
      },
      error: () => this.toastService.error('Allocation failed')
    });
  }

  // Role-based access control methods
  shouldShowField(field: string): boolean {
    switch (field) {
      case 'serialNumber':
      case 'purchaseDate':
      case 'vendor':
      case 'licenseKey':
        return this.permissions.canManageAssets || this.permissions.canManageSystem;
      default:
        return true;
    }
  }

  shouldShowFinancialInfo(): boolean {
    return this.permissions.canManageAssets || this.permissions.canManageSystem;
  }

  shouldShowGroupSummary(): boolean {
    return this.permissions.canManageAssets;
  }

  canManageAssets(): boolean {
    return this.permissions.canManageAssets || false;
  }

  canCreateIssues(): boolean {
    return this.permissions.canCreateIssues || false;
  }

  // Service record management methods
  addServiceRecord() {
    if (!this.canManageAssets()) {
      this.toastService.error('Access denied');
      return;
    }
    this.router.navigate(['/service-records/new'], { queryParams: { assetId: this.asset?.id } });
  }

  editServiceRecord(record: ServiceRecord) {
    if (!this.canManageAssets()) {
      this.toastService.error('Access denied');
      return;
    }
    this.router.navigate(['/service-records', record.id, 'edit']);
  }

  viewServiceRecord(record: ServiceRecord) {
    this.router.navigate(['/service-records', record.id]);
  }

  returnAsset() {
    if (!this.canManageAssets() || !this.asset) {
      this.toastService.error('Access denied');
      return;
    }
    
    const remarks = prompt('Enter return remarks (optional):');
    this.assetService.returnAsset(this.asset.id, remarks || undefined).subscribe({
      next: () => {
        this.toastService.success('Asset returned successfully');
        this.loadAsset(this.asset!.id);
      },
      error: () => this.toastService.error('Failed to return asset')
    });
  }

  viewAssetHistory() {
    if (!this.canManageAssets()) {
      this.toastService.error('Access denied');
      return;
    }
    // Navigate to asset history page or open modal
    this.router.navigate(['/assets', this.asset?.id, 'history']);
  }

  getTotalServiceCost(): number {
    if (!this.shouldShowFinancialInfo()) return 0;
    return (this.serviceRecords || []).reduce((total, record) => total + (record.cost || 0), 0);
  }
}