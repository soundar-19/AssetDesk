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
        <h1>{{ vendor.name }}</h1>
        <div class="actions">
          <button class="btn btn-outline" (click)="goBack()">Back</button>
          <button *ngIf="roleService.canManageAssets()" class="btn btn-primary" (click)="editVendor()">Edit</button>
        </div>
      </div>

      <div class="content">
        <div class="info-card">
          <h2>Vendor Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Name</label>
              <span>{{ vendor.name }}</span>
            </div>
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
            <div class="info-item">
              <label>Status</label>
              <span class="badge" [class]="'badge-' + (vendor.status || 'active').toLowerCase()">{{ vendor.status || 'Active' }}</span>
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
      align-items: center;
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--gray-200);
    }

    .header h1 {
      margin: 0;
      color: var(--gray-900);
    }

    .actions {
      display: flex;
      gap: var(--space-3);
    }

    .content {
      display: grid;
      gap: var(--space-6);
    }

    .info-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .info-card h2 {
      margin: 0 0 var(--space-4) 0;
      color: var(--gray-900);
      font-size: 1.25rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--space-4);
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .info-item label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-600);
    }

    .info-item span {
      color: var(--gray-900);
    }

    .badge {
      display: inline-block;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      width: fit-content;
    }

    .badge-active {
      background: var(--green-100);
      color: var(--green-700);
    }

    .badge-inactive {
      background: var(--gray-100);
      color: var(--gray-700);
    }

    .btn {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
      text-decoration: none;
    }

    .btn-primary {
      background: var(--primary-600);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-700);
    }

    .btn-outline {
      background: white;
      border-color: var(--gray-300);
      color: var(--gray-700);
    }

    .btn-outline:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
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
        align-items: stretch;
      }

      .actions {
        justify-content: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
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