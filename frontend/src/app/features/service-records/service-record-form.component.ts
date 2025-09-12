import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceRecordService } from '../../core/services/service-record.service';
import { AssetService } from '../../core/services/asset.service';
import { VendorService } from '../../core/services/vendor.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { Asset, Vendor } from '../../core/models';

@Component({
  selector: 'app-service-record-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="page-container" role="main">
      <div class="form-container">
        <div class="form-header">
          <div>
            <h1 class="form-title">{{ isEditMode ? 'Edit Service Record' : 'Add Service Record' }}</h1>
            <p class="form-subtitle">{{ isEditMode ? 'Update service record details and costs' : 'Record a new service or maintenance activity' }}</p>
          </div>
          <button class="btn btn-outline" (click)="goBack()" type="button">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back
          </button>
        </div>

        <form [formGroup]="serviceRecordForm" (ngSubmit)="onSubmit()" class="form" novalidate>
          <div class="form-section">
            <h2 class="section-title">Service Information</h2>
            <div class="form-grid grid-2">
              <div class="form-group">
                <label for="assetId" class="form-label required">Asset</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2H3zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                  </svg>
                  <select
                    id="assetId"
                    formControlName="assetId"
                    class="form-control"
                    [class.error]="serviceRecordForm.get('assetId')?.invalid && serviceRecordForm.get('assetId')?.touched">
                    <option value="">Select an asset</option>
                    <option *ngFor="let asset of assets" [value]="asset.id">{{ asset.assetTag }} - {{ asset.name }}</option>
                  </select>
                </div>
                <div *ngIf="serviceRecordForm.get('assetId')?.invalid && serviceRecordForm.get('assetId')?.touched" class="form-error">
                  Asset selection is required
                </div>
              </div>
              
              <div class="form-group">
                <label for="serviceType" class="form-label required">Service Type</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                  </svg>
                  <input
                    id="serviceType"
                    type="text"
                    formControlName="serviceType"
                    class="form-control"
                    [class.error]="serviceRecordForm.get('serviceType')?.invalid && serviceRecordForm.get('serviceType')?.touched"
                    placeholder="e.g., Repair, Maintenance, Upgrade">
                </div>
                <div *ngIf="serviceRecordForm.get('serviceType')?.invalid && serviceRecordForm.get('serviceType')?.touched" class="form-error">
                  Service type is required
                </div>
              </div>

              <div class="form-group">
                <label for="serviceDate" class="form-label required">Service Date</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  <input
                    id="serviceDate"
                    type="date"
                    formControlName="serviceDate"
                    class="form-control"
                    [class.error]="serviceRecordForm.get('serviceDate')?.invalid && serviceRecordForm.get('serviceDate')?.touched">
                </div>
                <div *ngIf="serviceRecordForm.get('serviceDate')?.invalid && serviceRecordForm.get('serviceDate')?.touched" class="form-error">
                  Service date is required
                </div>
              </div>
            </div>

            <div class="form-grid grid-2">
              <div class="form-group">
                <label for="performedBy" class="form-label">Performed By</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                  <input
                    id="performedBy"
                    type="text"
                    formControlName="performedBy"
                    class="form-control"
                    placeholder="Name of person who performed the service">
                </div>
              </div>
              
              <div class="form-group">
                <label for="vendorId" class="form-label">Vendor</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z"/>
                  </svg>
                  <select
                    id="vendorId"
                    formControlName="vendorId"
                    class="form-control">
                    <option value="">Select a vendor (optional)</option>
                    <option *ngFor="let vendor of vendors" [value]="vendor.id">{{ vendor.name }}</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="form-grid grid-1">
              <div class="form-group">
                <label for="description" class="form-label required">Description</label>
                <textarea
                  id="description"
                  formControlName="description"
                  class="form-control"
                  [class.error]="serviceRecordForm.get('description')?.invalid && serviceRecordForm.get('description')?.touched"
                  rows="4"
                  placeholder="Describe the service performed, parts replaced, or issues resolved"></textarea>
                <div *ngIf="serviceRecordForm.get('description')?.invalid && serviceRecordForm.get('description')?.touched" class="form-error">
                  Description is required
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title">Cost & Schedule Information</h2>
            <div class="form-grid grid-2">
              <div class="form-group">
                <label for="cost" class="form-label required">Service Cost</label>
                <div class="input-group">
                  <div class="input-group-text">$</div>
                  <input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    formControlName="cost"
                    class="form-control"
                    [class.error]="serviceRecordForm.get('cost')?.invalid && serviceRecordForm.get('cost')?.touched"
                    placeholder="0.00">
                </div>
                <div class="form-help">Enter the total cost including parts and labor</div>
                <div *ngIf="serviceRecordForm.get('cost')?.invalid && serviceRecordForm.get('cost')?.touched" class="form-error">
                  <span *ngIf="serviceRecordForm.get('cost')?.errors?.['required']">Cost is required</span>
                  <span *ngIf="serviceRecordForm.get('cost')?.errors?.['min']">Cost must be greater than or equal to 0</span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="nextServiceDate" class="form-label">Next Service Date</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  <input
                    id="nextServiceDate"
                    type="date"
                    formControlName="nextServiceDate"
                    class="form-control">
                </div>
                <div class="form-help">When is the next service due? (optional)</div>
              </div>
            </div>
            
            <div class="form-grid grid-1">
              <div class="form-group">
                <label for="notes" class="form-label">Additional Notes</label>
                <textarea
                  id="notes"
                  formControlName="notes"
                  class="form-control"
                  rows="3"
                  placeholder="Any additional notes or observations"></textarea>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="goBack()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="serviceRecordForm.invalid || loading">
              <span *ngIf="loading" class="loading-spinner"></span>
              {{ loading ? 'Saving...' : (isEditMode ? 'Update Record' : 'Create Record') }}
            </button>
          </div>
        </form>
      </div>
    </main>
  `,
  styles: []
})
export class ServiceRecordFormComponent implements OnInit {
  serviceRecordForm: FormGroup;
  isEditMode = false;
  serviceRecordId: number | null = null;
  loading = false;
  assets: Asset[] = [];
  vendors: Vendor[] = [];

  constructor(
    private fb: FormBuilder,
    private serviceRecordService: ServiceRecordService,
    private assetService: AssetService,
    private vendorService: VendorService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.serviceRecordForm = this.fb.group({
      assetId: ['', Validators.required],
      serviceType: ['', Validators.required],
      serviceDate: ['', Validators.required],
      description: ['', Validators.required],
      cost: ['', [Validators.required, Validators.min(0)]],
      vendorId: [''],
      performedBy: [''],
      nextServiceDate: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadAssets();
    this.loadVendors();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.serviceRecordId = +id;
      this.loadServiceRecord(this.serviceRecordId);
    }
    
    // Pre-select asset if provided in query params
    const assetId = this.route.snapshot.queryParamMap.get('assetId');
    if (assetId) {
      this.serviceRecordForm.patchValue({ assetId: +assetId });
    }
  }

  loadServiceRecord(id: number) {
    this.serviceRecordService.getServiceRecordById(id).subscribe({
      next: (record) => {
        this.serviceRecordForm.patchValue(record);
      },
      error: () => {
        this.toastService.error('Failed to load service record');
        this.goBack();
      }
    });
  }

  onSubmit() {
    if (this.serviceRecordForm.valid) {
      this.loading = true;
      const formData = this.serviceRecordForm.value;
      
      const request = this.isEditMode
        ? this.serviceRecordService.updateServiceRecord(this.serviceRecordId!, formData)
        : this.serviceRecordService.createServiceRecord(formData);
      
      request.subscribe({
        next: () => {
          this.toastService.success(`Service record ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.goBack();
        },
        error: () => {
          this.toastService.error(`Failed to ${this.isEditMode ? 'update' : 'create'} service record`);
          this.loading = false;
        }
      });
    }
  }
  
  loadAssets() {
    this.assetService.getAssets(0, 1000).subscribe({
      next: (response) => {
        this.assets = response.content;
      }
    });
  }
  
  loadVendors() {
    this.vendorService.getVendors(0, 1000).subscribe({
      next: (response) => {
        this.vendors = response.content;
      }
    });
  }

  goBack() {
    this.router.navigate(['/service-records']);
  }
}