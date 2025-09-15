import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VendorService } from '../../core/services/vendor.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-vendor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="page-container" role="main">
      <div class="form-container">
        <div class="form-header">
          <div>
            <h1 class="form-title">{{ isEditMode ? 'Edit Vendor' : 'Add Vendor' }}</h1>
            <p class="form-subtitle">{{ isEditMode ? 'Update vendor information and contact details' : 'Register a new vendor in the system' }}</p>
          </div>
          <button class="btn btn-outline" (click)="goBack()" type="button">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back
          </button>
        </div>

        <form [formGroup]="vendorForm" (ngSubmit)="onSubmit()" class="form" novalidate>
          <div class="form-section">
            <h2 class="section-title">Vendor Information</h2>
            <div class="form-grid grid-1">
              <div class="form-group">
                <label for="name" class="form-label required">Company Name</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 8a1 1 0 011-1h4a1 1 0 011 1v4H7v-4z" clip-rule="evenodd" />
                  </svg>
                  <input
                    id="name"
                    type="text"
                    formControlName="name"
                    class="form-control"
                    [class.error]="vendorForm.get('name')?.invalid && vendorForm.get('name')?.touched"
                    placeholder="Enter company name">
                </div>
                <div *ngIf="vendorForm.get('name')?.invalid && vendorForm.get('name')?.touched" class="form-error">
                  Company name is required
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title">Contact Information</h2>
            <div class="form-grid grid-2">
              <div class="form-group">
                <label for="contactPerson" class="form-label optional">Contact Person</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                  <input
                    id="contactPerson"
                    type="text"
                    formControlName="contactPerson"
                    class="form-control"
                    placeholder="Enter contact person name">
                </div>
              </div>

              <div class="form-group">
                <label for="phoneNumber" class="form-label optional">Phone Number</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <input
                    id="phoneNumber"
                    type="tel"
                    formControlName="phoneNumber"
                    class="form-control"
                    placeholder="Enter phone number">
                </div>
              </div>
            </div>

            <div class="form-grid grid-1">
              <div class="form-group">
                <label for="email" class="form-label optional">Email Address</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="form-control"
                    [class.error]="vendorForm.get('email')?.invalid && vendorForm.get('email')?.touched"
                    placeholder="Enter email address">
                </div>
                <div *ngIf="vendorForm.get('email')?.invalid && vendorForm.get('email')?.touched" class="form-error">
                  Please enter a valid email address
                </div>
              </div>
            </div>

            <div class="form-grid grid-1">
              <div class="form-group">
                <label for="status" class="form-label required">Status</label>
                <select
                  id="status"
                  formControlName="status"
                  class="form-control">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="goBack()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="vendorForm.invalid || loading">
              <span *ngIf="loading" class="loading-spinner"></span>
              {{ loading ? 'Saving...' : (isEditMode ? 'Update Vendor' : 'Create Vendor') }}
            </button>
          </div>
        </form>
      </div>
    </main>
  `,
  styles: []
})
export class VendorFormComponent implements OnInit {
  vendorForm: FormGroup;
  isEditMode = false;
  vendorId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.vendorForm = this.fb.group({
      name: ['', Validators.required],
      contactPerson: [''],
      email: ['', Validators.email],
      phoneNumber: [''],
      status: ['ACTIVE']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.vendorId = +id;
      this.loadVendor(this.vendorId);
    }
  }

  loadVendor(id: number) {
    this.vendorService.getVendorById(id).subscribe({
      next: (vendor) => {
        this.vendorForm.patchValue(vendor);
      },
      error: () => {
        this.toastService.error('Failed to load vendor');
        this.goBack();
      }
    });
  }

  onSubmit() {
    if (this.vendorForm.valid) {
      this.loading = true;
      const vendorData = this.vendorForm.value;
      
      const request = this.isEditMode 
        ? this.vendorService.updateVendor(this.vendorId!, vendorData)
        : this.vendorService.createVendor(vendorData);

      request.subscribe({
        next: () => {
          this.toastService.success(`Vendor ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.loading = false;
          this.goBack();
        },
        error: () => {
          this.toastService.error(`Failed to ${this.isEditMode ? 'update' : 'create'} vendor`);
          this.loading = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/vendors']);
  }
}