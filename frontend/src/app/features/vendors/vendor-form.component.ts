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
    <main class="page-container standardized-layout" role="main">
      <header class="page-header">
        <div class="header-content">
          <div>
            <h1 class="page-title">{{ isEditMode ? 'Edit Vendor' : 'Add New Vendor' }}</h1>
            <p class="page-description">{{ isEditMode ? 'Update vendor information and contact details' : 'Register a new vendor in the system' }}</p>
          </div>
          <button class="btn btn-outline" (click)="goBack()" type="button">
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back to Vendors
          </button>
        </div>
      </header>

      <section class="modern-form-card" aria-label="Vendor Form">
        <form [formGroup]="vendorForm" (ngSubmit)="onSubmit()" class="modern-form" novalidate>
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 8a1 1 0 011-1h4a1 1 0 011 1v4H7v-4z" clip-rule="evenodd" />
                </svg>
                Company Information
              </h2>
              <p class="section-description">Basic vendor details and company information</p>
            </div>
            
            <div class="form-grid">
              <div class="form-field full-width">
                <label for="name" class="field-label required">Company Name</label>
                <div class="input-wrapper">
                  <input
                    id="name"
                    type="text"
                    formControlName="name"
                    class="form-input"
                    [class.error]="vendorForm.get('name')?.invalid && vendorForm.get('name')?.touched"
                    placeholder="Enter company name">
                </div>
                <div *ngIf="vendorForm.get('name')?.invalid && vendorForm.get('name')?.touched" class="field-error">
                  <svg class="error-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  Company name is required
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                Contact Information
              </h2>
              <p class="section-description">Contact details and communication preferences</p>
            </div>
            
            <div class="form-grid">
              <div class="form-field">
                <label for="contactPerson" class="field-label optional">Contact Person</label>
                <div class="input-wrapper">
                  <input
                    id="contactPerson"
                    type="text"
                    formControlName="contactPerson"
                    class="form-input"
                    placeholder="Enter contact person name">
                </div>
              </div>

              <div class="form-field">
                <label for="phoneNumber" class="field-label optional">Phone Number</label>
                <div class="input-wrapper">
                  <input
                    id="phoneNumber"
                    type="tel"
                    formControlName="phoneNumber"
                    class="form-input"
                    placeholder="Enter phone number">
                </div>
              </div>

              <div class="form-field">
                <label for="email" class="field-label optional">Email Address</label>
                <div class="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="form-input"
                    [class.error]="vendorForm.get('email')?.invalid && vendorForm.get('email')?.touched"
                    placeholder="Enter email address">
                </div>
                <div *ngIf="vendorForm.get('email')?.invalid && vendorForm.get('email')?.touched" class="field-error">
                  <svg class="error-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  Please enter a valid email address
                </div>
              </div>

              <div class="form-field">
                <label for="status" class="field-label required">Status</label>
                <div class="select-wrapper">
                  <select
                    id="status"
                    formControlName="status"
                    class="form-select">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <div class="actions-wrapper">
              <button type="button" class="btn btn-secondary" (click)="goBack()">
                <svg class="btn-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
                Cancel
              </button>
              <button type="submit" class="btn btn-primary btn-lg" [disabled]="vendorForm.invalid || loading" [class.btn-loading]="loading">
                <svg *ngIf="!loading" class="btn-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path *ngIf="isEditMode" fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  <path *ngIf="!isEditMode" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                </svg>
                <span *ngIf="loading" class="loading-spinner" aria-hidden="true"></span>
                {{ loading ? 'Saving...' : (isEditMode ? 'Update Vendor' : 'Create Vendor') }}
              </button>
            </div>
          </div>
        </form>
      </section>
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
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      contactPerson: [''],
      email: ['', Validators.email],
      phoneNumber: [''],
      status: ['ACTIVE', Validators.required]
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