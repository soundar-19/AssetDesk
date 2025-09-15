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
  templateUrl: './asset-request-form.component.html',
  styleUrls: ['./asset-request-form.component.css']
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