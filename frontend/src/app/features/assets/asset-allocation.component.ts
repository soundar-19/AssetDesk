import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../../core/services/asset.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-asset-allocation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Allocate Asset</h1>
        <p class="page-description">Assign an asset to a user</p>
      </div>

      <div class="card">
        <form [formGroup]="allocationForm" (ngSubmit)="onSubmit()" class="form">
          <div class="form-row">
            <div class="form-group">
              <label for="groupName">Asset Group</label>
              <input
                id="groupName"
                type="text"
                formControlName="groupName"
                class="form-control"
                readonly>
            </div>

            <div class="form-group">
              <label for="userId">User *</label>
              <select
                id="userId"
                formControlName="userId"
                class="form-control"
                [class.error]="allocationForm.get('userId')?.invalid && allocationForm.get('userId')?.touched">
                <option value="">Select User</option>
                <option *ngFor="let user of users" [value]="user.id">
                  {{ user.name }} ({{ user.email }})
                </option>
              </select>
              <div *ngIf="allocationForm.get('userId')?.invalid && allocationForm.get('userId')?.touched" class="error-message">
                Please select a user
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="remarks">Remarks</label>
            <textarea
              id="remarks"
              formControlName="remarks"
              class="form-control"
              rows="3"
              placeholder="Optional allocation remarks"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="cancel()">
              Cancel
            </button>
            <button type="submit" 
                    class="btn btn-primary"
                    [disabled]="allocationForm.invalid || loading">
              <span *ngIf="loading" class="loading-spinner"></span>
              {{ loading ? 'Allocating...' : 'Allocate Asset' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .form-control {
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .form-control.error {
      border-color: var(--error-500);
    }

    .error-message {
      color: var(--error-600);
      font-size: 0.75rem;
    }

    .form-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
      margin-top: var(--space-6);
    }

    .loading-spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: var(--space-2);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AssetAllocationComponent implements OnInit {
  allocationForm: FormGroup;
  users: User[] = [];
  loading = false;
  groupName = '';

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.allocationForm = this.fb.group({
      groupName: [''],
      userId: ['', [Validators.required]],
      remarks: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.groupName = params['group'] || '';
      this.allocationForm.patchValue({ groupName: this.groupName });
    });

    this.loadUsers();
  }

  loadUsers() {
    this.userService.getActiveUsers(0, 100).subscribe({
      next: (response) => {
        this.users = response.content;
      },
      error: () => {
        this.toastService.error('Failed to load users');
      }
    });
  }

  onSubmit() {
    if (this.allocationForm.valid) {
      this.loading = true;
      const formData = this.allocationForm.value;

      // Enhanced allocation with better error handling
      this.assetService.allocateFromGroup(
        this.groupName,
        formData.userId,
        formData.remarks
      ).subscribe({
        next: (response) => {
          this.toastService.success('Asset allocated successfully');
          this.loading = false;
          // Navigate to the modern allocations page
          this.router.navigate(['/allocations']);
        },
        error: (error) => {
          console.error('Allocation error:', error);
          let errorMessage = 'Failed to allocate asset';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your connection.';
          } else if (error.status >= 500) {
            errorMessage = 'Server error occurred. Please try again later.';
          }
          
          this.toastService.error(errorMessage);
          this.loading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.allocationForm.controls).forEach(key => {
        this.allocationForm.get(key)?.markAsTouched();
      });
      this.toastService.error('Please fill in all required fields');
    }
  }

  cancel() {
    this.router.navigate(['/assets']);
  }
}