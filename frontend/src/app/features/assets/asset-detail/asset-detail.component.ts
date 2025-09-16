import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AssetService } from '../../../core/services/asset.service';
import { Asset, ServiceRecord, User, UserRole, AssetAllocation } from '../../../core/models';
import { AllocationService } from '../../../core/services/allocation.service';
import { ServiceRecordService } from '../../../core/services/service-record.service';
import { WarrantyHistoryService, WarrantyHistoryItem } from '../../../core/services/warranty-history.service';
import { IssueService } from '../../../core/services/issue.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ROLE_PERMISSIONS } from '../../../core/constants/role.constants';
import { UserSelectorDialogComponent } from '../../../shared/components/user-selector-dialog/user-selector-dialog.component';
import { InputModalService } from '../../../shared/components/input-modal/input-modal.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from '../../../shared/components/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, UserSelectorDialogComponent, ConfirmationDialogComponent],
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
            <button class="tab" [class.active]="activeTab === 'ownership'" (click)="setActiveTab('ownership')" *ngIf="canManageAssets()">Ownership History</button>
            <button class="tab" [class.active]="activeTab === 'service'" (click)="setActiveTab('service')">{{ canManageAssets() ? 'Service History' : 'Service Requests' }}</button>

            <button class="tab" [class.active]="activeTab === 'warranty'" (click)="setActiveTab('warranty')" *ngIf="canManageAssets()">Warranty</button>
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
                    <div class="info-item" *ngIf="asset.category !== 'SOFTWARE'">
                      <label>Model:</label>
                      <span>{{ asset.model || 'N/A' }}</span>
                    </div>
                    <div class="info-item" *ngIf="shouldShowField('serialNumber') && asset.category !== 'SOFTWARE'">
                      <label>Serial Number:</label>
                      <span class="serial">{{ asset.serialNumber || 'N/A' }}</span>
                    </div>
                    <div class="info-item" *ngIf="shouldShowField('purchaseDate')">
                      <label>Purchase Date:</label>
                      <span>{{ formatDate(asset.purchaseDate) }}</span>
                    </div>
                    <div class="info-item" *ngIf="asset.category !== 'SOFTWARE'">
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
                      <span>{{ depreciation?.usefulLifeYears || asset.usefulLifeYears || '5 (default)' }} years</span>
                    </div>
                    <div class="info-item" *ngIf="depreciation && depreciation.currentValue !== null && depreciation.currentValue !== undefined">
                      <label>Current Value:</label>
                      <span class="cost">\${{ depreciation.currentValue | number:'1.2-2' }}</span>
                    </div>
                    <div class="info-item" *ngIf="depreciation && depreciation.currentValue !== null && depreciation.currentValue !== undefined && asset.cost">
                      <label>Depreciation:</label>
                      <span class="depreciation">\${{ (asset.cost - depreciation.currentValue) | number:'1.2-2' }}</span>
                    </div>
                  </div>
                  <div class="depreciation-chart" *ngIf="depreciation && depreciation.currentValue !== null && depreciation.currentValue !== undefined && asset.cost && asset.cost > 0">
                    <div class="chart-header">
                      <span>Asset Value Over Time</span>
                      <span class="percentage">{{ getDepreciationPercentage() }}% depreciated</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress" [style.width.%]="(depreciation.currentValue / asset.cost) * 100"></div>
                    </div>
                  </div>
                </div>

                <div class="info-section" *ngIf="asset.category === 'SOFTWARE' || asset.type === 'LICENSE'">
                  <h3><i class="icon-key"></i> License Information</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Version:</label>
                      <span class="version">{{ asset.version || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Total Licenses:</label>
                      <span class="license-count">{{ asset.totalLicenses || 1 }}</span>
                    </div>
                    <div class="info-item">
                      <label>Used Licenses:</label>
                      <span class="license-used">{{ asset.usedLicenses || 0 }}</span>
                    </div>
                    <div class="info-item">
                      <label>Available Licenses:</label>
                      <span class="license-available">{{ (asset.totalLicenses || 1) - (asset.usedLicenses || 0) }}</span>
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

                <div class="info-section" *ngIf="currentAllocation && !asset?.isShareable && asset?.category !== 'SOFTWARE'">
                  <h3><i class="icon-user"></i> Current Owner</h3>
                  <div class="allocation-card">
                    <div class="user-info">
                      <div class="user-name" (click)="viewUserDetails(currentAllocation.userId)" style="cursor: pointer; color: var(--primary-600);">{{ currentAllocation.userName }}</div>
                      <div class="user-details">{{ currentAllocation.userEmail }}</div>
                    </div>
                    <div class="allocation-details">
                      <div class="detail-item">
                        <label>Allocated Date:</label>
                        <span>{{ formatDate(currentAllocation.allocatedDate) }}</span>
                      </div>
                      <div class="detail-item">
                        <label>Duration:</label>
                        <span>{{ currentAllocation.daysAllocated }} days</span>
                      </div>
                      <div class="detail-item" *ngIf="currentAllocation.returnRequestDate">
                        <label>Return Status:</label>
                        <span class="status status-requested">Return Requested</span>
                      </div>
                      <div class="detail-item" *ngIf="currentAllocation.returnRequestDate">
                        <label>Return Requested:</label>
                        <span>{{ formatDate(currentAllocation.returnRequestDate) }}</span>
                      </div>
                      <div class="detail-item" *ngIf="currentAllocation.returnRequestRemarks">
                        <label>Return Reason:</label>
                        <span>{{ currentAllocation.returnRequestRemarks }}</span>
                      </div>
                      <div class="detail-item" *ngIf="currentAllocation.remarks">
                        <label>Remarks:</label>
                        <span>{{ currentAllocation.remarks }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="info-section" *ngIf="(asset?.isShareable || asset?.category === 'SOFTWARE') && getCurrentActiveUsers().length > 0">
                  <h3><i class="icon-users"></i> Current Users</h3>
                  <div class="users-list">
                    <div *ngFor="let user of getCurrentActiveUsers()" class="user-card">
                      <div class="user-info">
                        <div class="user-name" (click)="viewUserDetails(user.userId)" style="cursor: pointer; color: var(--primary-600);">{{ user.userName }}</div>
                        <div class="user-details">{{ user.userEmail }}</div>
                      </div>
                      <div class="allocation-date">{{ formatDate(user.allocatedDate) }}</div>
                    </div>
                  </div>
                </div>


              </div>
            </div>

            <!-- Ownership History Tab -->
            <div *ngIf="activeTab === 'ownership'" class="tab-panel">
              <div class="section-header">
                <h3><i class="icon-users"></i> Ownership History</h3>
              </div>
              <div class="ownership-timeline" *ngIf="ownershipHistory.length > 0; else noOwnership">
                <div *ngFor="let period of ownershipHistory" class="ownership-period">
                  <div class="period-header">
                    <div class="owner-info">
                      <div class="owner-name" (click)="viewUserDetails(period.userId)" style="cursor: pointer; color: var(--primary-600);">{{ period.userName }}</div>
                      <div class="owner-email">{{ period.userEmail }}</div>
                    </div>
                    <div class="period-dates">
                      <span class="allocated-date">{{ formatDate(period.allocatedDate) }}</span>
                      <span class="separator">→</span>
                      <span class="returned-date">{{ period.returnedDate ? formatDate(period.returnedDate) : 'Current' }}</span>
                      <span class="duration">({{ period.daysAllocated }} days)</span>
                    </div>
                  </div>
                  

                  
                  <div class="period-remarks" *ngIf="period.remarks">
                    <strong>Remarks:</strong> {{ period.remarks }}
                  </div>
                </div>
              </div>
              <ng-template #noOwnership>
                <div class="empty-state">
                  <i class="icon-users"></i>
                  <h4>No Ownership History</h4>
                  <p>This asset has never been allocated to any user.</p>
                </div>
              </ng-template>
            </div>

            <!-- Service History Tab -->
            <div *ngIf="activeTab === 'service'" class="tab-panel">
              <div class="section-header">
                <h3><i class="icon-tool"></i> Service History Log</h3>
                <div class="service-actions">
                  <div class="service-summary">
                    <span class="summary-item">Total Services: {{ serviceRecords.length }}</span>
                    <span class="summary-item" *ngIf="getTotalServiceCost() > 0 && shouldShowFinancialInfo()">Total Cost: \${{ getTotalServiceCost() | number:'1.2-2' }}</span>
                  </div>
                  <button class="btn btn-primary" (click)="addServiceRecord()" *ngIf="canManageAssets()">
                    <i class="icon-plus"></i> Add Service Record
                  </button>
                </div>
              </div>
              <div class="service-records" *ngIf="serviceRecords.length > 0; else noServiceRecords">
                <div *ngFor="let record of serviceRecords" class="service-record-card" (click)="openIssueFromService(record)" style="cursor: pointer;">
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
                    <div class="description" *ngIf="getServiceDescription(record)">
                      <strong>Description:</strong> {{ getServiceDescription(record) }}
                    </div>
                    <div class="service-details">
                      <div class="detail-row">
                        <div class="detail-item" *ngIf="getServiceCost(record) > 0">
                          <label>Cost:</label>
                          <span class="cost">\${{ getServiceCost(record) | number:'1.2-2' }}</span>
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
            <button class="action-btn edit-btn" (click)="editAsset()" *ngIf="canManageAssets()">
              <i class="icon-edit"></i> Edit Asset
            </button>
            <button class="action-btn issue-btn" (click)="reportIssue()" *ngIf="canCreateIssues()">
              <i class="icon-alert"></i> Report Issue
            </button>
            <!-- For shareable assets (software) -->
            <button class="action-btn allocate-btn" *ngIf="(asset?.isShareable || asset?.category === 'SOFTWARE') && canManageAssets() && hasAvailableLicenses()" (click)="allocateAsset()">
              <i class="icon-user"></i> Allocate License ({{ getAvailableLicenseCount() }} available)
            </button>
            <button class="action-btn return-btn" *ngIf="(asset?.isShareable || asset?.category === 'SOFTWARE') && canManageAssets() && getCurrentActiveUsers().length > 0" (click)="initiateReturn()">
              <i class="icon-return"></i> Return License
            </button>
            
            <!-- For non-shareable assets (hardware) -->
            <button class="action-btn allocate-btn" *ngIf="!(asset?.isShareable || asset?.category === 'SOFTWARE') && asset?.status === 'AVAILABLE' && canManageAssets()" (click)="allocateAsset()">
              <i class="icon-user"></i> Allocate
            </button>
            <button class="action-btn return-btn" *ngIf="!(asset?.isShareable || asset?.category === 'SOFTWARE') && asset?.status === 'ALLOCATED' && canManageAssets()" (click)="initiateReturn()">
              <i class="icon-return"></i> Request Return
            </button>
            <button class="action-btn return-btn" *ngIf="!(asset?.isShareable || asset?.category === 'SOFTWARE') && asset?.status === 'ALLOCATED' && canManageAssets() && hasReturnRequest()" (click)="forceReturn()">
              <i class="icon-return"></i> Force Return
            </button>
            <button class="action-btn delete-btn" (click)="deleteAsset()" *ngIf="canManageAssets()">
              <i class="icon-delete"></i> Delete Asset
            </button>
          </div>

          <div class="asset-stats">
            <h4>Statistics</h4>

            <div class="stat-item">
              <label>Service Records:</label>
              <span>{{ serviceRecords.length }}</span>
            </div>
            <div class="stat-item" *ngIf="depreciation && depreciation.yearsUsed !== null && depreciation.yearsUsed !== undefined && shouldShowFinancialInfo()">
              <label>Age:</label>
              <span>{{ depreciation.yearsUsed }} years</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-user-selector-dialog 
      *ngIf="showUserSelector"
      [show]="showUserSelector"
      [singleUser]="!(asset?.isShareable || asset?.category === 'SOFTWARE')"
      [licenseCount]="getAvailableLicenseCount()"
      [licenseName]="asset?.name || 'Asset'"
      [assetId]="asset?.id || null"
      [mode]="'allocate'"
      (onConfirm)="onUserSelected($event)"
      (onCancel)="closeUserSelector()">
    </app-user-selector-dialog>

    <app-user-selector-dialog 
      *ngIf="showReturnUserSelector"
      [show]="showReturnUserSelector"
      [singleUser]="false"
      [licenseCount]="allocatedUsersForReturn.length"
      [licenseName]="asset?.name || 'Asset'"
      [allocatedUsers]="allocatedUsersForReturn"
      [mode]="'return'"
      (onConfirm)="onReturnUsersSelected($event)"
      (onCancel)="closeReturnUserSelector()">
    </app-user-selector-dialog>

    <app-confirmation-dialog
      [show]="(confirmationService.show$ | async) || false"
      [title]="(confirmationService.config$ | async)?.title || 'Confirm'"
      [message]="(confirmationService.config$ | async)?.message || 'Are you sure?'"
      [confirmText]="(confirmationService.config$ | async)?.confirmText || 'Confirm'"
      [cancelText]="(confirmationService.config$ | async)?.cancelText || 'Cancel'"
      (onConfirm)="confirmationService.onConfirm()"
      (onCancel)="confirmationService.onCancel()">
    </app-confirmation-dialog>
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
      background: var(--success-50); 
      color: var(--success-700); 
    }
    
    .badge.type { 
      background: var(--primary-50); 
      color: var(--primary-700); 
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
    
    .status-requested {
      background: var(--warning-500);
    }
    
    .status-acknowledged {
      background: var(--primary-500);
    }
    
    .status-completed {
      background: var(--success-500);
    }
    
    .status-none {
      background: var(--gray-400);
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
      margin-top: var(--space-3); 
      padding: var(--space-3);
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
    }
    
    .chart-header, .usage-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: var(--space-2); 
      font-size: 0.875rem;
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
    
    .user-list, .users-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .user-item, .user-card { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8f9fa; border-radius: 0.5rem; }
    .user-name { font-weight: 600; }
    .user-dept { color: #666; font-size: 0.875rem; }
    .user-email { color: #007bff; font-size: 0.875rem; }
    .allocation-date { color: #666; font-size: 0.875rem; font-weight: 500; }
    
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
    .reporter { color: #666; font-size: 0.875rem; }
    .issue-description { margin-top: 0.5rem; color: #666; font-size: 0.875rem; }
    .issue-resolution { margin-top: 0.5rem; padding: 0.5rem; background: #d4edda; border-radius: 0.375rem; font-size: 0.875rem; }
    
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
    
    .edit-btn {
      color: var(--primary-600);
    }
    
    .edit-btn:hover {
      background: var(--primary-50);
      color: var(--primary-700);
    }
    
    .issue-btn {
      color: var(--warning-600);
    }
    
    .issue-btn:hover {
      background: var(--warning-50);
      color: var(--warning-700);
    }
    
    .allocate-btn {
      color: var(--success-600);
    }
    
    .allocate-btn:hover {
      background: var(--success-50);
      color: var(--success-700);
    }
    
    .return-btn {
      color: var(--primary-500);
    }
    
    .return-btn:hover {
      background: var(--primary-50);
      color: var(--primary-700);
    }
    
    .delete-btn {
      color: var(--error-600);
    }
    
    .delete-btn:hover {
      background: var(--error-50);
      color: var(--error-700);
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
    
    .ownership-timeline { display: flex; flex-direction: column; gap: 1.5rem; }
    .ownership-period { background: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
    .period-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .owner-name { font-weight: 600; color: #1a1a1a; font-size: 1.125rem; }
    .owner-email { color: #666; font-size: 0.875rem; }
    .period-dates { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
    .allocated-date, .returned-date { font-weight: 500; }
    .separator { color: #666; }
    .duration { color: #666; font-size: 0.75rem; }
    .period-services { margin-top: 1rem; }
    .period-services h4 { margin: 0 0 0.75rem 0; font-size: 1rem; color: #1a1a1a; }
    .service-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .service-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f8f9fa; border-radius: 0.375rem; }
    .service-date { font-weight: 500; color: #666; font-size: 0.875rem; }
    .service-description { flex: 1; margin: 0 1rem; }
    .service-cost { font-weight: 600; color: #28a745; }
    .period-remarks { margin-top: 1rem; padding: 0.75rem; background: #f8f9fa; border-radius: 0.375rem; border-left: 3px solid #007bff; font-size: 0.875rem; }
    
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
  currentAllocation: AssetAllocation | null = null;
  serviceRecords: ServiceRecord[] = [];
  ownershipHistory: AssetAllocation[] = [];
  warrantyHistory: WarrantyHistoryItem[] = [];
  recentIssues: any[] = [];
  depreciation: any = null;

  activeTab = 'overview';
  showLicenseKey = false;
  showUserSelector = false;
  showReturnUserSelector = false;
  allocatedUsersForReturn: User[] = [];
  currentUser: User | null = null;
  userRole: UserRole | null = null;
  permissions: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private assetService: AssetService,
    private allocationService: AllocationService,
    private serviceRecordService: ServiceRecordService,
    private issueService: IssueService,
    private warrantyHistoryService: WarrantyHistoryService,
    private authService: AuthService,
    private toastService: ToastService,
    private inputModalService: InputModalService,
    public confirmationService: ConfirmationDialogService
  ) {}

  ngOnInit() {
    this.initializeUserContext();
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Asset ID from route:', id);
    if (id && !isNaN(+id)) {
      this.loadAsset(+id);
    } else {
      console.error('Invalid asset ID:', id);
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
    
    // Reset component state
    this.asset = null;
    this.currentAllocation = null;
    this.ownershipHistory = [];
    this.serviceRecords = [];
    
    this.assetService.getAssetById(id).subscribe({
      next: (asset) => {
        console.log('Asset loaded successfully:', asset);
        this.asset = asset;
        this.loadAssetData(id);
      },
      error: (error) => {
        console.error('Error loading asset ID', id, ':', error);
        if (error.status === 404) {
          this.toastService.error(`Asset with ID ${id} not found. It may have been deleted.`);
        } else if (error.status === 403) {
          this.toastService.error('Access denied to this asset.');
        } else {
          this.toastService.error(`Failed to load asset: ${error.message || 'Unknown error'}`);
        }
        this.router.navigate(['/assets']);
      }
    });
  }

  private loadAssetData(id: number) {
    this.loadOwnershipHistory(id);
    this.loadServiceRecords(id);
    this.loadWarrantyHistory(id);
    this.loadRecentIssues(id);
    
    if (this.permissions.canManageAssets || this.permissions.canManageSystem) {
      this.loadDepreciation(id);
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
        const allRecords = response || [];
        console.log('All service records full data:', allRecords);
        // Filter out allocation/return events, keep only actual service records
        this.serviceRecords = allRecords.filter(record => {
          const description = this.getServiceDescription(record).toLowerCase();
          return !description.includes('allocated to') && 
                 !description.includes('returned by') &&
                 !description.includes('asset allocated') &&
                 !description.includes('asset returned');
        }).sort((a, b) => b.id - a.id);
        console.log('Filtered service records:', this.serviceRecords);
      },
      error: (error) => {
        console.error('Error loading service records:', error);
        this.serviceRecords = [];
      }
    });
  }

  loadDepreciation(assetId: number) {
    this.assetService.getDepreciation(assetId).subscribe({
      next: (data) => {
        this.depreciation = data;
      },
      error: (error) => {
        console.error('Error loading depreciation:', error);
        this.depreciation = null;
      }
    });
  }

  loadCurrentAllocation(assetId: number) {
    this.allocationService.getCurrentAllocationByAsset(assetId).subscribe({
      next: (allocation) => {
        if (allocation) {
          const alloc = allocation as any;
          this.currentAllocation = {
            ...allocation,
            userId: alloc.user?.id || allocation.userId,
            userName: alloc.user?.name || allocation.userName,
            userEmail: alloc.user?.email || allocation.userEmail,
            daysAllocated: Math.ceil((new Date().getTime() - new Date(allocation.allocatedDate).getTime()) / (1000 * 60 * 60 * 24))
          };
        } else {
          this.currentAllocation = null;
        }
      },
      error: (error) => {
        // 404 is expected for assets with no current allocation - suppress console errors
        if (error.status !== 404) {
          console.error('Error loading current allocation:', error);
        }
        this.currentAllocation = null;
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



  editAsset() {
    if (!this.canManageAssets()) {
      this.toastService.error('Access denied');
      return;
    }
    this.router.navigate(['/assets', this.asset?.id, 'edit']);
  }

  goBack() {
    this.location.back();
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
    if (!this.depreciation || !this.asset || !this.asset.cost || this.asset.cost === 0) return 0;
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
    if (!this.asset?.id) {
      this.toastService.error('Asset ID not available');
      return;
    }
    this.router.navigate(['/assets', this.asset.id, 'issue']);
  }

  isServiceOverdue(nextServiceDate: string | null | undefined): boolean {
    if (!nextServiceDate) return false;
    return new Date(nextServiceDate) < new Date();
  }

  trackByServiceId(index: number, record: ServiceRecord): number {
    return record.id;
  }

  getFilteredServiceRecords(): ServiceRecord[] {
    return this.serviceRecords || [];
  }

  getServiceDescription(record: ServiceRecord): string {
    return (record as any).serviceDescription || record.description || '';
  }

  getServiceCost(record: ServiceRecord): number {
    const serviceRecord = record as any;
    const cost = serviceRecord.serviceCost || serviceRecord.resolutionCost || record.cost || 0;
    console.log('Service record cost check:', {id: record.id, serviceCost: serviceRecord.serviceCost, finalCost: cost});
    return cost;
  }

  openIssueFromService(record: ServiceRecord) {
    const serviceRecord = record as any;
    
    // Check if service record has issue ID
    if (serviceRecord.issueId) {
      this.router.navigate(['/issues', serviceRecord.issueId]);
      return;
    }
    
    // Try to extract issue ID from description
    const description = this.getServiceDescription(record);
    const issueIdMatch = description.match(/#(\d+)/); // Look for #123 pattern
    
    if (issueIdMatch) {
      const issueId = parseInt(issueIdMatch[1]);
      this.router.navigate(['/issues', issueId]);
    } else if (description.toLowerCase().includes('issue')) {
      // If it's issue-related but no ID found, go to issues list
      this.router.navigate(['/issues']);
    }
  }



  allocateAsset() {
    if (!this.canManageAssets() || !this.asset) {
      this.toastService.error('Access denied');
      return;
    }
    
    if (this.asset.status !== 'AVAILABLE' && !(this.asset.isShareable || this.asset.category === 'SOFTWARE')) {
      this.toastService.error('Asset is not available for allocation');
      return;
    }
    
    // For shareable assets, check if licenses are available
    if ((this.asset.isShareable || this.asset.category === 'SOFTWARE') && !this.hasAvailableLicenses()) {
      this.toastService.error('No licenses available for allocation');
      return;
    }
    
    this.showUserSelector = true;
  }

  onUserSelected(users: User[]) {
    this.closeUserSelector();
    
    if (!users.length || !this.asset) return;
    
    if (users.length === 1) {
      // Single user allocation
      const user = users[0];
      this.assetService.allocateAsset(this.asset.id, user.id).subscribe({
        next: (updatedAsset) => {
          this.toastService.success(`Asset allocated to ${user.name} successfully`);
          if (updatedAsset) {
            this.asset = updatedAsset;
          }
          this.loadAsset(this.asset!.id);
        },
        error: () => this.toastService.error('Failed to allocate asset')
      });
    } else {
      // Sequential allocation for multiple users to ensure proper license counting
      this.allocateUsersSequentially(users, 0, 0, 0);
    }
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

  initiateReturn() {
    if (!this.canManageAssets() || !this.asset) {
      this.toastService.error('Access denied');
      return;
    }
    
    if (this.asset.isShareable || this.asset.category === 'SOFTWARE') {
      // For shareable assets, show user selector to choose which users to return
      // Refresh the ownership history first to get latest data
      this.loadOwnershipHistory(this.asset.id);
      
      // Use setTimeout to ensure ownership history is loaded before getting allocated users
      setTimeout(() => {
        this.allocatedUsersForReturn = this.getAllocatedUsers();
        console.log('Allocated users for return:', this.allocatedUsersForReturn);
        
        if (this.allocatedUsersForReturn.length === 0) {
          this.toastService.error('No users currently have this license allocated');
          return;
        }
        
        this.showReturnUserSelector = true;
      }, 100);
    } else {
      // For non-shareable assets, send return request first
      this.requestAssetReturn();
    }
  }

  async requestAssetReturn() {
    if (!this.canManageAssets() || !this.asset) {
      this.toastService.error('Access denied');
      return;
    }
    
    const remarks = await this.inputModalService.promptText(
      'Request Asset Return',
      'Enter reason for return request:',
      'Please return this asset...',
      '',
      false
    );
    
    if (remarks !== null) {
      this.allocationService.requestReturn(this.asset.id, remarks || '').subscribe({
        next: () => {
          this.toastService.success('Return request sent to user. They will be notified to return the asset.');
          this.loadAsset(this.asset!.id);
        },
        error: () => this.toastService.error('Failed to send return request')
      });
    }
  }

  async returnAsset() {
    if (!this.canManageAssets() || !this.asset) {
      this.toastService.error('Access denied');
      return;
    }
    
    const remarks = await this.inputModalService.promptText(
      'Return Asset',
      'Enter return remarks (optional):',
      'Optional remarks...',
      '',
      false
    );
    
    if (remarks !== null) {
      this.assetService.returnAsset(this.asset.id, remarks || undefined).subscribe({
        next: () => {
          this.toastService.success('Asset returned successfully');
          this.loadAsset(this.asset!.id);
        },
        error: () => this.toastService.error('Failed to return asset')
      });
    }
  }

  onReturnUsersSelected(users: User[]) {
    this.closeReturnUserSelector();
    
    if (!users.length || !this.asset) return;
    
    // Sequential return for multiple users to ensure proper license counting
    this.returnUsersSequentially(users, 0, 0, 0);
  }

  async deleteAsset() {
    if (!this.canManageAssets() || !this.asset) {
      this.toastService.error('Access denied');
      return;
    }
    
    // Check if asset has any allocations (current or historical)
    if (this.asset.status === 'ALLOCATED' || this.getCurrentActiveUsers().length > 0) {
      this.toastService.error('Cannot delete asset. Asset is currently allocated. Please return all allocations first.');
      return;
    }
    
    // Check for allocation history
    if (this.ownershipHistory && this.ownershipHistory.length > 0) {
      this.toastService.error('Cannot delete asset. Asset has allocation history. Only assets that have never been allocated can be deleted.');
      return;
    }
    
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Asset',
      message: `Are you sure you want to delete "${this.asset.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
    
    if (confirmed) {
      this.assetService.deleteAsset(this.asset.id).subscribe({
        next: () => {
          this.toastService.success('Asset deleted successfully');
          this.router.navigate(['/assets']);
        },
        error: (error) => {
          if (error.status === 409) {
            this.toastService.error('Cannot delete asset. Asset has related records that prevent deletion.');
          } else {
            const errorMsg = error.error?.message || 'Failed to delete asset';
            this.toastService.error(errorMsg);
          }
        }
      });
    }
  }

  getTotalServiceCost(): number {
    if (!this.shouldShowFinancialInfo()) return 0;
    return this.serviceRecords.reduce((total, record) => total + (record.cost || 0), 0);
  }

  loadOwnershipHistory(assetId: number) {
    this.allocationService.getAllocationsByAsset(assetId).subscribe({
      next: (allocations) => {
        this.ownershipHistory = (allocations || []).map(allocation => {
          const alloc = allocation as any;
          return {
            ...allocation,
            userId: alloc.user?.id || allocation.userId,
            userName: alloc.user?.name || allocation.userName,
            userEmail: alloc.user?.email || allocation.userEmail,
            assetId: alloc.asset?.id || allocation.assetId,
            assetName: alloc.asset?.name || allocation.assetName,
            assetTag: alloc.asset?.assetTag || allocation.assetTag,
            daysAllocated: allocation.returnedDate ? 
              Math.ceil((new Date(allocation.returnedDate).getTime() - new Date(allocation.allocatedDate).getTime()) / (1000 * 60 * 60 * 24)) :
              Math.ceil((new Date().getTime() - new Date(allocation.allocatedDate).getTime()) / (1000 * 60 * 60 * 24))
          };
        }).sort((a, b) => b.id - a.id);
        
        // Set current allocation from ownership history for non-shareable assets
        if (this.asset && !this.asset.isShareable && this.asset.category !== 'SOFTWARE') {
          const current = this.ownershipHistory.find(h => !h.returnedDate);
          if (current) {
            this.currentAllocation = current;
          }
        }
      },
      error: (error) => {
        this.ownershipHistory = [];
      }
    });
  }



  viewUserDetails(userId: number) {
    this.router.navigate(['/users', userId]);
  }

  viewIssueDetails(issueId: number) {
    this.router.navigate(['/issues', issueId]);
  }

  getAllocatedUsers(): User[] {
    if (!this.ownershipHistory || this.ownershipHistory.length === 0) {
      return [];
    }
    
    // Get all current allocations (no return date)
    const currentAllocations = this.ownershipHistory.filter(allocation => !allocation.returnedDate);
    
    if (currentAllocations.length === 0) {
      return [];
    }
    
    // Convert to User objects with proper IDs
    return currentAllocations.map(allocation => ({
      id: allocation.userId,
      name: allocation.userName || 'Unknown User',
      email: allocation.userEmail || '',
      employeeId: '', // Not available in allocation data
      role: 'EMPLOYEE' as any,
      department: '',
      designation: '',
      status: 'ACTIVE' as any,
      phoneNumber: '',
      dateJoined: '',
      password: ''
    }));
  }
  
  getCurrentActiveUsers(): any[] {
    if (!this.ownershipHistory) return [];
    return this.ownershipHistory.filter(allocation => !allocation.returnedDate);
  }
  
  hasAvailableLicenses(): boolean {
    if (!this.asset || !(this.asset.isShareable || this.asset.category === 'SOFTWARE')) {
      return false;
    }
    
    const totalLicenses = this.asset.totalLicenses || 1;
    const usedLicenses = this.asset.usedLicenses || 0;
    
    return usedLicenses < totalLicenses;
  }
  
  getAvailableLicenseCount(): number {
    if (!this.asset || !(this.asset.isShareable || this.asset.category === 'SOFTWARE')) {
      return 0;
    }
    
    const totalLicenses = this.asset.totalLicenses || 1;
    const usedLicenses = this.asset.usedLicenses || 0;
    
    return Math.max(0, totalLicenses - usedLicenses);
  }
  
  closeUserSelector() {
    this.showUserSelector = false;
  }
  
  closeReturnUserSelector() {
    this.showReturnUserSelector = false;
    this.allocatedUsersForReturn = [];
  }

  getReturnStatusLabel(status: string): string {
    switch (status) {
      case 'REQUESTED': return 'Return Requested';
      case 'ACKNOWLEDGED': return 'User Acknowledged';
      case 'COMPLETED': return 'Returned';
      case 'NONE': return 'No Request';
      default: return status;
    }
  }
  
  private allocateUsersSequentially(users: User[], index: number, successCount: number, errorCount: number) {
    if (index >= users.length) {
      // All allocations completed
      if (errorCount === 0) {
        this.toastService.success(`Asset allocated to ${successCount} users successfully`);
      } else {
        this.toastService.success(`Asset allocated to ${successCount} users (${errorCount} failed)`);
      }
      this.loadAsset(this.asset!.id);
      return;
    }
    
    const user = users[index];
    this.assetService.allocateAsset(this.asset!.id, user.id).subscribe({
      next: (updatedAsset) => {
        if (updatedAsset) {
          this.asset = updatedAsset;
        }
        this.allocateUsersSequentially(users, index + 1, successCount + 1, errorCount);
      },
      error: () => {
        this.allocateUsersSequentially(users, index + 1, successCount, errorCount + 1);
      }
    });
  }
  
  private returnUsersSequentially(users: User[], index: number, successCount: number, errorCount: number) {
    if (index >= users.length) {
      // All returns completed
      if (errorCount === 0) {
        this.toastService.success(`License returned for ${successCount} users successfully`);
      } else {
        this.toastService.success(`License returned for ${successCount} users (${errorCount} failed)`);
      }
      this.loadAsset(this.asset!.id);
      return;
    }
    
    const user = users[index];
    this.allocationService.returnFromUser(this.asset!.id, user.id, `License returned for ${user.name}`).subscribe({
      next: () => {
        this.returnUsersSequentially(users, index + 1, successCount + 1, errorCount);
      },
      error: () => {
        this.returnUsersSequentially(users, index + 1, successCount, errorCount + 1);
      }
    });
  }

  hasReturnRequest(): boolean {
    // Check if current allocation has a return request
    return !!this.currentAllocation?.returnRequestDate;
  }

  async forceReturn() {
    if (!this.canManageAssets() || !this.asset) {
      this.toastService.error('Access denied');
      return;
    }
    
    const confirmed = await this.confirmationService.confirm({
      title: 'Force Return Asset',
      message: `Are you sure you want to force return "${this.asset.name}"? This will mark the asset as returned without user confirmation.`,
      confirmText: 'Force Return',
      cancelText: 'Cancel'
    });
    
    if (confirmed) {
      const remarks = await this.inputModalService.promptText(
        'Force Return Asset',
        'Enter return remarks:',
        'Asset forcibly returned by admin',
        'Asset forcibly returned by admin',
        false
      );
      
      if (remarks !== null) {
        this.assetService.returnAsset(this.asset.id, remarks || 'Asset forcibly returned by admin').subscribe({
          next: () => {
            this.toastService.success('Asset returned successfully');
            this.loadAsset(this.asset!.id);
          },
          error: () => this.toastService.error('Failed to return asset')
        });
      }
    }
  }
}