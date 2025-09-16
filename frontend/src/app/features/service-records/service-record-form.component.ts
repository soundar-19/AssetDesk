import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceRecordService } from '../../core/services/service-record.service';
import { AssetService } from '../../core/services/asset.service';
import { VendorService } from '../../core/services/vendor.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-service-record-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h1>{{ isEdit ? 'Edit' : 'New' }} Service Record</h1>
        <button class="btn btn-outline" (click)="goBack()">← Back</button>
      </div>

      <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()" class="service-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="assetId">Asset *</label>
            <select id="assetId" formControlName="assetId" class="form-control">
              <option value="">Select Asset</option>
              <option *ngFor="let asset of assets" [value]="asset.id">
                {{ asset.assetTag }} - {{ asset.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="serviceDate">Service Date *</label>
            <input type="date" id="serviceDate" formControlName="serviceDate" class="form-control">
          </div>

          <div class="form-group">
            <label for="serviceType">Service Type *</label>
            <select id="serviceType" formControlName="serviceType" class="form-control">
              <option value="">Select Type</option>
              <option value="Issue Resolution">Issue Resolution</option>
              <option value="Preventive Maintenance">Preventive Maintenance</option>
              <option value="Corrective Maintenance">Corrective Maintenance</option>
              <option value="Emergency Repair">Emergency Repair</option>
              <option value="Inspection">Inspection</option>
              <option value="Calibration">Calibration</option>
              <option value="Upgrade">Upgrade</option>
              <option value="Replacement">Replacement</option>
            </select>
          </div>

          <div class="form-group">
            <label for="performedBy">Performed By</label>
            <input type="text" id="performedBy" formControlName="performedBy" class="form-control">
          </div>

          <div class="form-group">
            <label for="vendorId">Vendor</label>
            <select id="vendorId" formControlName="vendorId" class="form-control">
              <option value="">Internal/No Vendor</option>
              <option *ngFor="let vendor of vendors" [value]="vendor.id">
                {{ vendor.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="cost">Cost</label>
            <input type="number" id="cost" formControlName="cost" class="form-control" step="0.01" min="0">
          </div>

          <div class="form-group">
            <label for="nextServiceDate">Next Service Date</label>
            <input type="date" id="nextServiceDate" formControlName="nextServiceDate" class="form-control">
          </div>

          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" formControlName="status" class="form-control">
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div class="form-group full-width">
          <label for="serviceDescription">Service Description *</label>
          <textarea id="serviceDescription" formControlName="serviceDescription" 
                    class="form-control" rows="4" 
                    placeholder="Describe the service performed..."></textarea>
        </div>

        <div class="form-group full-width">
          <label for="notes">Additional Notes</label>
          <textarea id="notes" formControlName="notes" 
                    class="form-control" rows="3" 
                    placeholder="Any additional notes or observations..."></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="goBack()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="serviceForm.invalid || loading">
            {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }} Service Record
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .form-header h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .service-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      border: none;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-outline {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-outline:hover {
      background: #f9fafb;
    }
  `]
})
export class ServiceRecordFormComponent implements OnInit {
  serviceForm: FormGroup;
  isEdit = false;
  loading = false;
  recordId: number | null = null;
  assets: any[] = [];
  vendors: any[] = [];

  constructor(
    private fb: FormBuilder,
    private serviceRecordService: ServiceRecordService,
    private assetService: AssetService,
    private vendorService: VendorService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.serviceForm = this.fb.group({
      assetId: ['', Validators.required],
      serviceDate: ['', Validators.required],
      serviceType: ['', Validators.required],
      serviceDescription: ['', Validators.required],
      performedBy: [''],
      vendorId: [''],
      cost: ['', [Validators.min(0.01)]],
      nextServiceDate: [''],
      status: ['COMPLETED'],
      notes: ['']
    });
  }

  ngOnInit() {
    this.recordId = this.route.snapshot.params['id'];
    this.isEdit = !!this.recordId;
    
    this.loadAssets();
    this.loadVendors();
    
    if (this.isEdit) {
      this.loadServiceRecord();
    }

    // Pre-fill asset if provided in query params
    const assetId = this.route.snapshot.queryParams['assetId'];
    if (assetId) {
      this.serviceForm.patchValue({ assetId: parseInt(assetId) });
    }
  }

  loadAssets() {
    this.assetService.getAssets(0, 1000).subscribe({
      next: (response) => {
        this.assets = response.content || [];
      },
      error: () => {
        this.toastService.error('Failed to load assets');
      }
    });
  }

  loadVendors() {
    this.vendorService.getVendors(0, 1000).subscribe({
      next: (response) => {
        this.vendors = response.content || [];
      },
      error: () => {
        this.toastService.error('Failed to load vendors');
      }
    });
  }

  loadServiceRecord() {
    if (!this.recordId) return;
    
    this.serviceRecordService.getServiceRecordById(this.recordId).subscribe({
      next: (record) => {
        this.serviceForm.patchValue({
          assetId: record.asset?.id,
          serviceDate: record.serviceDate,
          serviceType: record.serviceType,
          serviceDescription: record.description,
          performedBy: record.performedBy,
          vendorId: record.vendor?.id,
          cost: record.cost,
          nextServiceDate: record.nextServiceDate,
          status: record.status || 'COMPLETED',
          notes: record.notes
        });
      },
      error: () => {
        this.toastService.error('Failed to load service record');
        this.goBack();
      }
    });
  }

  onSubmit() {
    if (this.serviceForm.invalid) return;

    this.loading = true;
    const formData = this.serviceForm.value;

    const request = {
      assetId: parseInt(formData.assetId),
      serviceDate: formData.serviceDate,
      serviceType: formData.serviceType,
      serviceDescription: formData.serviceDescription,
      performedBy: formData.performedBy || null,
      vendorId: formData.vendorId ? parseInt(formData.vendorId) : undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      nextServiceDate: formData.nextServiceDate || undefined,
      status: formData.status,
      notes: formData.notes || undefined
    };

    const operation = this.isEdit 
      ? this.serviceRecordService.updateServiceRecord(this.recordId!, request)
      : this.serviceRecordService.createServiceRecord(request);

    operation.subscribe({
      next: () => {
        this.toastService.success(`Service record ${this.isEdit ? 'updated' : 'created'} successfully`);
        this.goBack();
      },
      error: () => {
        this.toastService.error(`Failed to ${this.isEdit ? 'update' : 'create'} service record`);
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/service-records']);
  }
}