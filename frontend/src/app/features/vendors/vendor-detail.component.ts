import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VendorService } from '../../core/services/vendor.service';
import { Vendor } from '../../core/models';
import { RoleService } from '../../core/services/role.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vendor-detail" *ngIf="vendor">
      <div class="header">
        <div class="vendor-info">
          <h1>{{ vendor.name }}</h1>
          <span class="status-badge" [class]="'status-' + (vendor.status || 'active').toLowerCase()">
            {{ vendor.status || 'Active' }}
          </span>
        </div>
        <div class="actions">
          <button class="btn btn-outline" (click)="goBack()">← Back</button>
          <button *ngIf="roleService.canManageAssets()" class="btn btn-primary" (click)="editVendor()">Edit</button>
        </div>
      </div>

      <div class="content">
        <div class="info-section">
          <h2>Contact Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Contact Person</label>
              <span>{{ vendor.contactPerson || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span>{{ vendor.email || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <span>{{ vendor.phoneNumber || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Address</label>
              <span>{{ vendor.address || 'Not provided' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!vendor && !loading" class="error">
      Vendor not found
    </div>

    <div *ngIf="loading" class="loading">
      Loading vendor details...
    </div>
  `,
  styles: [`
    .vendor-detail {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--space-6);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-8);
      padding-bottom: var(--space-4);
      border-bottom: 2px solid var(--gray-100);
    }

    .vendor-info h1 {
      margin: 0 0 var(--space-2) 0;
      color: var(--gray-900);
      font-size: 2rem;
      font-weight: 700;
    }

    .status-badge {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active {
      background: var(--success-100);
      color: var(--success-700);
    }

    .status-inactive {
      background: var(--gray-100);
      color: var(--gray-700);
    }

    .actions {
      display: flex;
      gap: var(--space-3);
    }

    .content {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .info-section h2 {
      margin: 0 0 var(--space-6) 0;
      color: var(--gray-900);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-6);
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .info-item label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-item span {
      color: var(--gray-900);
      font-size: 1rem;
    }

    .loading, .error {
      text-align: center;
      padding: var(--space-12);
      color: var(--gray-500);
    }

    @media (max-width: 768px) {
      .vendor-detail {
        padding: var(--space-4);
      }

      .header {
        flex-direction: column;
        gap: var(--space-4);
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: var(--space-4);
      }
    }
  `]
})
export class VendorDetailComponent implements OnInit {
  vendor: Vendor | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    public roleService: RoleService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVendor(+id);
    }
  }

  loadVendor(id: number) {
    this.loading = true;
    this.vendorService.getVendorById(id).subscribe({
      next: (vendor) => {
        this.vendor = vendor;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load vendor details');
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/vendors']);
  }

  editVendor() {
    if (this.vendor) {
      this.router.navigate(['/vendors', this.vendor.id, 'edit']);
    }
  }


}