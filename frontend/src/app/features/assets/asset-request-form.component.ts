import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AssetRequest } from '../../core/models';

@Component({
  selector: 'app-asset-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="request-page">
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1>{{ isEditMode ? 'Edit Asset Request' : 'Request New Asset' }}</h1>
            <p>{{ isEditMode ? 'Update your asset request details' : 'Get the equipment you need to be productive' }}</p>
          </div>
          <button class="back-btn" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"/>
            </svg>
            Back
          </button>
        </div>
      </div>

      <div class="form-wrapper">
        <div class="progress-bar">
          <div class="progress-step active">1</div>
          <div class="progress-line"></div>
          <div class="progress-step">2</div>
          <div class="progress-line"></div>
          <div class="progress-step">3</div>
        </div>
        
        <form [formGroup]="requestForm" (ngSubmit)="onSubmit()" class="modern-form">
          <!-- Step 1: Request Type -->
          <div class="form-step">
            <div class="step-header">
              <div class="step-icon">📋</div>
              <div class="step-info">
                <h3>Request Details</h3>
                <p>Tell us what you need</p>
              </div>
            </div>
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

          <!-- Step 2: Asset Details -->
          <div class="form-step">
            <div class="step-header">
              <div class="step-icon">💻</div>
              <div class="step-info">
                <h3>Asset Specifications</h3>
                <p>Specify the asset details</p>
              </div>
            </div>
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


            </div>
          </div>

          <!-- Step 3: Business Justification -->
          <div class="form-step">
            <div class="step-header">
              <div class="step-icon">🎯</div>
              <div class="step-info">
                <h3>Business Case</h3>
                <p>Justify your request</p>
              </div>
            </div>
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
          <div class="form-step">
            <div class="step-header">
              <div class="step-icon">📝</div>
              <div class="step-info">
                <h3>Additional Details</h3>
                <p>Any extra information</p>
              </div>
            </div>
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

          <!-- Submit Section -->
          <div class="submit-section">
            <div class="submit-card">
              <div class="submit-header">
                <h3>Ready to Submit?</h3>
                <p>Review your request and submit when ready</p>
              </div>
              <div class="submit-actions">
                <button type="button" class="btn-secondary" (click)="goBack()" [disabled]="loading">
                  Cancel
                </button>
                <button type="submit" class="btn-primary" [disabled]="requestForm.invalid || loading">
                  <span *ngIf="loading" class="spinner"></span>
                  <svg *ngIf="!loading" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 8.207a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 9.586z"/>
                  </svg>
                  {{ isEditMode ? 'Update Request' : 'Submit Request' }}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .request-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .hero-section {
      padding: 3rem 2rem;
      color: white;
    }
    
    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .hero-text h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
    }
    
    .hero-text p {
      font-size: 1.25rem;
      opacity: 0.9;
      margin: 0;
    }
    
    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 50px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .back-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
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
    
    .form-wrapper {
      max-width: 800px;
      margin: -2rem auto 0;
      padding: 0 2rem 2rem;
      position: relative;
      z-index: 1;
    }
    
    .progress-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 3rem;
      background: white;
      padding: 1.5rem;
      border-radius: 50px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .progress-step {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #6b7280;
    }
    
    .progress-step.active {
      background: #3b82f6;
      color: white;
    }
    
    .progress-line {
      width: 60px;
      height: 2px;
      background: #e5e7eb;
      margin: 0 1rem;
    }
    
    .modern-form {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .form-step {
      padding: 2rem;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .form-step:last-child {
      border-bottom: none;
    }
    
    .step-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .step-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .step-info h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }
    
    .step-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
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
    
    .submit-section {
      padding: 2rem;
      background: #f8fafc;
    }
    
    .submit-card {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      text-align: center;
    }
    
    .submit-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .submit-header p {
      margin: 0 0 2rem 0;
      color: #6b7280;
    }
    
    .submit-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 50px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    }
    
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .btn-secondary {
      background: white;
      color: #6b7280;
      border: 2px solid #e5e7eb;
      padding: 1rem 2rem;
      border-radius: 50px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-secondary:hover:not(:disabled) {
      border-color: #d1d5db;
      transform: translateY(-1px);
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
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid white;
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
  isEditMode = false;
  requestId: number | null = null;
  existingRequest: AssetRequest | null = null;

  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.requestForm = this.fb.group({
      requestType: ['', [Validators.required]],
      category: ['', [Validators.required]],
      assetType: ['', [Validators.required]],
      assetName: ['', [Validators.required]],
      preferredModel: [''],

      businessJustification: ['', [Validators.required, Validators.minLength(20)]],
      priority: ['', [Validators.required]],
      requiredDate: [''],
      specifications: [''],
      additionalNotes: ['']
    });
  }

  ngOnInit() {
    // Check if we're in edit mode
    const id = this.route.snapshot.params['id'];
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode = true;
      this.requestId = parseInt(id);
      this.loadExistingRequest();
    } else {
      // Set default required date to 2 weeks from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      this.requestForm.patchValue({
        requiredDate: defaultDate.toISOString().split('T')[0]
      });
    }
  }

  loadExistingRequest() {
    if (!this.requestId) return;
    
    this.loading = true;
    this.requestService.getRequestById(this.requestId).subscribe({
      next: (request) => {
        this.existingRequest = request;
        
        // Check if user can edit this request
        const currentUser = this.authService.getCurrentUser();
        if (request.status !== 'PENDING' || 
            (currentUser?.id !== request.requestedBy?.id && !this.canManageRequests())) {
          this.toastService.error('You cannot edit this request');
          this.goBack();
          return;
        }
        
        // Populate form with existing data
        this.updateAvailableTypes(request.category);
        this.requestForm.patchValue({
          requestType: request.requestType,
          category: request.category,
          assetType: request.assetType,
          assetName: request.assetName,
          preferredModel: request.preferredModel || '',

          businessJustification: request.businessJustification,
          priority: request.priority,
          requiredDate: request.requiredDate || '',
          specifications: request.specifications || '',
          additionalNotes: request.additionalNotes || ''
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading request:', error);
        this.toastService.error('Failed to load request details');
        this.loading = false;
        this.goBack();
      }
    });
  }

  canManageRequests(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === 'ADMIN' || currentUser?.role === 'IT_SUPPORT';
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

        businessJustification: formValue.businessJustification,
        priority: formValue.priority,
        requiredDate: formValue.requiredDate || null,
        specifications: formValue.specifications || '',
        additionalNotes: formValue.additionalNotes || '',
        requestedBy: currentUser.id
      };

      if (this.isEditMode && this.requestId) {
        this.requestService.updateRequest(this.requestId, requestData).subscribe({
          next: () => {
            this.toastService.success('Asset request updated successfully');
            this.loading = false;
            this.router.navigate(['/requests', this.requestId]);
          },
          error: (error) => {
            console.error('Request update error:', error);
            this.toastService.error(error?.error?.message || 'Failed to update request');
            this.loading = false;
          }
        });
      } else {
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
      }
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