import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-asset-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Request Asset</h1>
          <p class="page-description">Submit a request for a new asset</p>
        </div>
        <button class="btn btn-outline" (click)="goBack()">
          ← Back to Requests
        </button>
      </div>

      <div class="form-container">
        <form [formGroup]="requestForm" (ngSubmit)="onSubmit()" class="asset-request-form">
          <!-- Request Type -->
          <div class="form-section">
            <h3>Request Type</h3>
            <div class="form-group">
              <label for="requestType">Type of Request *</label>
              <select id="requestType" 
                      class="form-control" 
                      formControlName="requestType"
                      [class.error]="isFieldInvalid('requestType')">
                <option value="">Select request type...</option>
                <option value="NEW_ASSET">New Asset</option>
                <option value="REPLACEMENT">Replacement</option>
                <option value="UPGRADE">Upgrade</option>
                <option value="ADDITIONAL">Additional Asset</option>
              </select>
              <div class="error-message" *ngIf="isFieldInvalid('requestType')">
                Request type is required
              </div>
            </div>
          </div>

          <!-- Asset Details -->
          <div class="form-section">
            <h3>Asset Details</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="category">Category *</label>
                <select id="category" 
                        class="form-control" 
                        formControlName="category"
                        [class.error]="isFieldInvalid('category')"
                        (change)="onCategoryChange()">
                  <option value="">Select category...</option>
                  <option value="HARDWARE">Hardware</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="ACCESSORIES">Accessories</option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('category')">
                  Category is required
                </div>
              </div>

              <div class="form-group">
                <label for="assetType">Asset Type *</label>
                <select id="assetType" 
                        class="form-control" 
                        formControlName="assetType"
                        [class.error]="isFieldInvalid('assetType')"
                        [disabled]="!availableTypes.length">
                  <option value="">Select type...</option>
                  <option *ngFor="let type of availableTypes" [value]="type">{{ type }}</option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('assetType')">
                  Asset type is required
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="assetName">Asset Name *</label>
              <input type="text" 
                     id="assetName" 
                     class="form-control" 
                     formControlName="assetName"
                     [class.error]="isFieldInvalid('assetName')"
                     placeholder="e.g., Dell Laptop, Microsoft Office License">
              <div class="error-message" *ngIf="isFieldInvalid('assetName')">
                Asset name is required
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="preferredModel">Preferred Model/Brand</label>
                <input type="text" 
                       id="preferredModel" 
                       class="form-control" 
                       formControlName="preferredModel"
                       placeholder="e.g., Dell XPS 13, MacBook Pro">
              </div>

              <div class="form-group">
                <label for="estimatedCost">Estimated Cost</label>
                <input type="number" 
                       id="estimatedCost" 
                       class="form-control" 
                       formControlName="estimatedCost"
                       min="0"
                       step="0.01"
                       placeholder="0.00">
              </div>
            </div>
          </div>

          <!-- Business Justification -->
          <div class="form-section">
            <h3>Business Justification</h3>
            <div class="form-group">
              <label for="businessJustification">Justification *</label>
              <textarea id="businessJustification" 
                        class="form-control" 
                        formControlName="businessJustification"
                        [class.error]="isFieldInvalid('businessJustification')"
                        rows="4"
                        placeholder="Explain why this asset is needed, how it will be used, and the business impact..."></textarea>
              <div class="error-message" *ngIf="isFieldInvalid('businessJustification')">
                Business justification is required
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="priority">Priority *</label>
                <select id="priority" 
                        class="form-control" 
                        formControlName="priority"
                        [class.error]="isFieldInvalid('priority')">
                  <option value="">Select priority...</option>
                  <option value="LOW">Low - Can wait 30+ days</option>
                  <option value="MEDIUM">Medium - Needed within 2-4 weeks</option>
                  <option value="HIGH">High - Needed within 1-2 weeks</option>
                  <option value="URGENT">Urgent - Needed immediately</option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('priority')">
                  Priority is required
                </div>
              </div>

              <div class="form-group">
                <label for="requiredDate">Required By Date</label>
                <input type="date" 
                       id="requiredDate" 
                       class="form-control" 
                       formControlName="requiredDate"
                       [min]="minDate">
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="form-section">
            <h3>Additional Information</h3>
            <div class="form-group">
              <label for="specifications">Technical Specifications</label>
              <textarea id="specifications" 
                        class="form-control" 
                        formControlName="specifications"
                        rows="3"
                        placeholder="Any specific technical requirements, configurations, or features needed..."></textarea>
            </div>

            <div class="form-group">
              <label for="additionalNotes">Additional Notes</label>
              <textarea id="additionalNotes" 
                        class="form-control" 
                        formControlName="additionalNotes"
                        rows="3"
                        placeholder="Any other relevant information..."></textarea>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="goBack()" [disabled]="loading">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="requestForm.invalid || loading">
              <span *ngIf="loading" class="loading-spinner"></span>
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
      padding: var(--space-6);
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }
    
    .page-title {
      margin: 0 0 var(--space-2) 0;
      color: var(--gray-900);
      font-size: 1.875rem;
      font-weight: 700;
    }
    
    .page-description {
      margin: 0;
      color: var(--gray-600);
      font-size: 1rem;
    }
    
    .form-container {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }
    
    .asset-request-form {
      padding: var(--space-8);
    }
    
    .form-section {
      margin-bottom: var(--space-8);
      padding-bottom: var(--space-6);
      border-bottom: 1px solid var(--gray-200);
    }
    
    .form-section:last-of-type {
      border-bottom: none;
      margin-bottom: var(--space-6);
    }
    
    .form-section h3 {
      margin: 0 0 var(--space-5) 0;
      color: var(--gray-900);
      font-size: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    
    .form-section h3::before {
      content: '';
      width: 4px;
      height: 1.25rem;
      background: var(--primary-500);
      border-radius: var(--radius-sm);
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }
    
    .form-group {
      margin-bottom: var(--space-5);
    }
    
    .form-group label {
      display: block;
      margin-bottom: var(--space-2);
      font-weight: 500;
      color: var(--gray-700);
      font-size: 0.875rem;
    }
    
    .form-control {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      transition: all var(--transition-fast);
      background: white;
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }
    
    .form-control:disabled {
      background: var(--gray-100);
      color: var(--gray-500);
      cursor: not-allowed;
    }
    
    .form-control.error {
      border-color: var(--error-500);
    }
    
    .form-control.error:focus {
      border-color: var(--error-500);
      box-shadow: 0 0 0 3px var(--error-100);
    }
    
    .error-message {
      color: var(--error-600);
      font-size: 0.75rem;
      margin-top: var(--space-1);
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
    
    .error-message::before {
      content: '⚠';
      font-size: 0.875rem;
    }
    
    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding-top: var(--space-6);
      border-top: 1px solid var(--gray-200);
    }
    
    .btn {
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-width: 120px;
      justify-content: center;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: var(--primary-600);
      color: white;
      border-color: var(--primary-600);
    }
    
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-700);
      border-color: var(--primary-700);
      transform: translateY(-1px);
    }
    
    .btn-secondary {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }
    
    .btn-outline {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
    }
    
    .btn-outline:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }
    
    .loading-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: var(--space-4);
      }
      
      .asset-request-form {
        padding: var(--space-6);
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column-reverse;
      }
      
      .form-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class AssetRequestFormComponent implements OnInit {
  requestForm: FormGroup;
  loading = false;
  minDate = new Date().toISOString().split('T')[0];
  availableTypes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.requestForm = this.fb.group({
      requestType: ['', [Validators.required]],
      category: ['', [Validators.required]],
      assetType: ['', [Validators.required]],
      assetName: ['', [Validators.required]],
      preferredModel: [''],
      estimatedCost: [null, [Validators.min(0)]],
      businessJustification: ['', [Validators.required, Validators.minLength(20)]],
      priority: ['', [Validators.required]],
      requiredDate: [''],
      specifications: [''],
      additionalNotes: ['']
    });
  }

  ngOnInit() {
    // Set default required date to 2 weeks from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    this.requestForm.patchValue({
      requiredDate: defaultDate.toISOString().split('T')[0]
    });
  }

  onCategoryChange() {
    const category = this.requestForm.get('category')?.value;
    this.updateAvailableTypes(category);
    this.requestForm.get('assetType')?.setValue(''); // Reset type when category changes
  }

  updateAvailableTypes(category: string) {
    switch (category) {
      case 'HARDWARE':
        this.availableTypes = ['LAPTOP', 'DESKTOP', 'MONITOR', 'PRINTER', 'TABLET'];
        break;
      case 'SOFTWARE':
        this.availableTypes = ['LICENSE'];
        break;
      case 'ACCESSORIES':
        this.availableTypes = ['KEYBOARD', 'MOUSE', 'HEADSET', 'WEBCAM', 'CABLE', 'ADAPTER', 'CHARGER', 'DOCKING_STATION'];
        break;
      default:
        this.availableTypes = [];
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.requestForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.requestForm.valid) {
      this.loading = true;
      
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.toastService.error('User not authenticated');
        this.loading = false;
        return;
      }

      const formValue = this.requestForm.value;
      const requestData = {
        requestType: formValue.requestType,
        category: formValue.category,
        assetType: formValue.assetType,
        assetName: formValue.assetName,
        preferredModel: formValue.preferredModel || '',
        estimatedCost: formValue.estimatedCost || 0,
        businessJustification: formValue.businessJustification,
        priority: formValue.priority,
        requiredDate: formValue.requiredDate || null,
        specifications: formValue.specifications || '',
        additionalNotes: formValue.additionalNotes || '',
        requestedBy: currentUser.id
      };

      this.requestService.createAssetRequest(requestData).subscribe({
        next: () => {
          this.toastService.success('Asset request submitted successfully');
          this.loading = false;
          this.router.navigate(['/requests']);
        },
        error: (error) => {
          console.error('Request submission error:', error);
          this.toastService.error(error?.error?.message || 'Failed to submit request');
          this.loading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.requestForm.controls).forEach(key => {
        this.requestForm.get(key)?.markAsTouched();
      });
      this.toastService.error('Please fill in all required fields');
    }
  }

  goBack() {
    this.router.navigate(['/requests']);
  }
}