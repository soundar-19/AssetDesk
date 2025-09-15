import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceRecordService } from '../../core/services/service-record.service';
import { ServiceRecord } from '../../core/models';
import { ToastService } from '../../shared/components/toast/toast.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-service-record-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detail-container">
      <div class="detail-header">
        <div class="header-content">
          <button class="btn btn-outline" (click)="goBack()">← Back</button>
          <h1>Service Record Details</h1>
        </div>
        <div class="header-actions" *ngIf="roleService.canManageAssets()">
          <button class="btn btn-outline" (click)="editRecord()">✏️ Edit</button>

        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading service record...</p>
      </div>

      <div *ngIf="!loading && serviceRecord" class="detail-content">
        <!-- Service Overview -->
        <div class="overview-section">
          <div class="overview-card">
            <div class="card-header">
              <h2>Service Overview</h2>
              <div class="status-badge" [class]="'status-' + (serviceRecord.status || 'completed').toLowerCase()">
                {{ formatStatus(serviceRecord.status || 'COMPLETED') }}
              </div>
            </div>
            
            <div class="overview-grid">
              <div class="overview-item">
                <span class="item-label">Service Date</span>
                <span class="item-value">{{ formatDate(serviceRecord.serviceDate) }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">Service Type</span>
                <span class="item-value">{{ serviceRecord.serviceType }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">Performed By</span>
                <span class="item-value">{{ serviceRecord.performedBy || 'Not specified' }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">Cost</span>
                <span class="item-value cost">{{ serviceRecord.cost ? formatCurrency(serviceRecord.cost) : 'No cost recorded' }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">Vendor</span>
                <span class="item-value">{{ serviceRecord.vendor?.name || 'Internal' }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">Next Service</span>
                <span class="item-value" [class.overdue]="isOverdue()">
                  {{ serviceRecord.nextServiceDate ? formatDate(serviceRecord.nextServiceDate) : 'Not scheduled' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Information -->
        <div class="asset-section">
          <div class="asset-card">
            <div class="card-header">
              <h2>Asset Information</h2>
              <button class="btn btn-outline btn-sm" (click)="viewAsset()">View Asset</button>
            </div>
            
            <div class="asset-info">
              <div class="asset-main">
                <h3>{{ serviceRecord.asset?.assetTag }}</h3>
                <p>{{ serviceRecord.asset?.name }}</p>
                <span class="asset-category">{{ serviceRecord.asset?.category || 'N/A' }}</span>
              </div>
              <div class="asset-details">
                <div class="detail-item">
                  <span class="detail-label">Model</span>
                  <span class="detail-value">{{ serviceRecord.asset?.model || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Serial Number</span>
                  <span class="detail-value">{{ serviceRecord.asset?.serialNumber || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status</span>
                  <span class="detail-value">{{ serviceRecord.asset?.status || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Description -->
        <div class="description-section">
          <div class="description-card">
            <h2>Service Description</h2>
            <div class="description-content">
              <p>{{ serviceRecord.description }}</p>
            </div>
          </div>
        </div>

        <!-- Additional Notes -->
        <div class="notes-section" *ngIf="serviceRecord.notes">
          <div class="notes-card">
            <h2>Additional Notes</h2>
            <div class="notes-content">
              <p>{{ serviceRecord.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Service History -->
        <div class="history-section">
          <div class="history-card">
            <div class="card-header">
              <h2>Related Service History</h2>
              <span class="history-count">{{ relatedServices.length }} records</span>
            </div>
            
            <div class="history-list" *ngIf="relatedServices.length > 0">
              <div *ngFor="let service of relatedServices" class="history-item">
                <div class="history-date">{{ formatDate(service.serviceDate) }}</div>
                <div class="history-content">
                  <div class="history-type">{{ service.serviceType }}</div>
                  <div class="history-description">{{ service.description }}</div>
                </div>
                <div class="history-cost">{{ service.cost ? formatCurrency(service.cost) : '-' }}</div>
              </div>
            </div>
            
            <div *ngIf="relatedServices.length === 0" class="empty-history">
              <p>No other service records found for this asset</p>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !serviceRecord" class="error-state">
        <h2>Service Record Not Found</h2>
        <p>The requested service record could not be found.</p>
        <button class="btn btn-primary" (click)="goBack()">Go Back</button>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #f9fafb;
      min-height: 100vh;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-content h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .detail-content {
      display: grid;
      gap: 2rem;
    }

    .overview-section, .asset-section, .description-section, .notes-section, .history-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-badge.status-completed {
      background: #dcfce7;
      color: #166534;
    }

    .status-badge.status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.status-cancelled {
      background: #fef2f2;
      color: #991b1b;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .overview-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .item-label {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    .item-value {
      font-size: 1rem;
      color: #1f2937;
      font-weight: 600;
    }

    .item-value.cost {
      color: #3b82f6;
      font-size: 1.125rem;
    }

    .item-value.overdue {
      color: #ef4444;
    }

    .asset-info {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
      padding: 1.5rem;
    }

    .asset-main h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .asset-main p {
      margin: 0 0 0.5rem 0;
      color: #6b7280;
    }

    .asset-category {
      padding: 0.25rem 0.75rem;
      background: #f3f4f6;
      border-radius: 12px;
      font-size: 0.75rem;
      color: #374151;
    }

    .asset-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-value {
      font-weight: 500;
      color: #1f2937;
    }

    .description-content, .notes-content {
      padding: 1.5rem;
      line-height: 1.6;
      color: #374151;
    }

    .history-count {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .history-list {
      padding: 1.5rem;
    }

    .history-item {
      display: grid;
      grid-template-columns: 120px 1fr 100px;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      align-items: start;
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .history-date {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    .history-type {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .history-description {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .history-cost {
      text-align: right;
      font-weight: 600;
      color: #3b82f6;
    }

    .empty-history {
      padding: 2rem;
      text-align: center;
      color: #6b7280;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 4rem;
      color: #6b7280;
    }

    .loading-spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid #f3f4f6;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-outline {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-outline:hover {
      background: #f9fafb;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }

    @media (max-width: 1024px) {
      .detail-container {
        padding: 1.5rem;
      }
      
      .overview-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .detail-container {
        padding: 1rem;
      }
      
      .detail-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .overview-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .asset-info {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .history-item {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      
      .card-header {
        padding: 1rem;
      }
    }
    
    @media (max-width: 480px) {
      .detail-container {
        padding: 0.5rem;
      }
      
      .overview-grid {
        padding: 1rem;
      }
      
      .asset-info {
        padding: 1rem;
      }
    }
  `]
})
export class ServiceRecordDetailComponent implements OnInit {
  serviceRecord: ServiceRecord | null = null;
  relatedServices: ServiceRecord[] = [];
  loading = true;
  recordId: number;

  constructor(
    private serviceRecordService: ServiceRecordService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    public roleService: RoleService
  ) {
    this.recordId = this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.loadServiceRecord();
  }

  loadServiceRecord() {
    this.serviceRecordService.getServiceRecordById(this.recordId).subscribe({
      next: (record) => {
        this.serviceRecord = record;
        this.loadRelatedServices();
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load service record');
        this.loading = false;
      }
    });
  }

  loadRelatedServices() {
    if (!this.serviceRecord?.asset?.id) return;

    this.serviceRecordService.getServiceRecordsByAsset(this.serviceRecord.asset.id).subscribe({
      next: (records) => {
        this.relatedServices = records
          .filter(r => r.id !== this.recordId)
          .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
          .slice(0, 10);
      },
      error: () => {
        console.error('Failed to load related services');
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  isOverdue(): boolean {
    if (!this.serviceRecord?.nextServiceDate) return false;
    return new Date(this.serviceRecord.nextServiceDate) < new Date();
  }

  goBack() {
    this.router.navigate(['/service-records']);
  }

  editRecord() {
    this.router.navigate(['/service-records', this.recordId, 'edit']);
  }

  viewAsset() {
    if (this.serviceRecord?.asset?.id) {
      this.router.navigate(['/assets', this.serviceRecord.asset.id]);
    }
  }


}