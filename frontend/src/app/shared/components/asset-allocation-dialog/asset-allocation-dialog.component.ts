import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AssetService } from '../../../core/services/asset.service';
import { ToastService } from '../toast/toast.service';
import { User, Asset } from '../../../core/models';

@Component({
  selector: 'app-asset-allocation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="dialog-overlay" *ngIf="show" (click)="onCancel()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <h2 class="dialog-title">
          {{ mode === 'allocate' ? 'Allocate Asset' : 'Return Asset' }}
        </h2>
        
        <div class="asset-info">
          <h3>{{ asset.name }}</h3>
          <p class="asset-tag">{{ asset.assetTag }}</p>
        </div>

      <form [formGroup]="allocationForm" (ngSubmit)="onSubmit()" class="form">
          <div class="form-group" *ngIf="mode === 'allocate'">
          <label for="userId">Select User *</label>
          <select
            id="userId"
            formControlName="userId"
            class="form-select"
            [class.error]="allocationForm.get('userId')?.invalid && allocationForm.get('userId')?.touched">
            <option value="">Choose a user...</option>
            <option *ngFor="let user of users" [value]="user.id">
              {{ user.name }} ({{ user.email }}) - {{ user.department }}
            </option>
          </select>
          <div *ngIf="allocationForm.get('userId')?.invalid && allocationForm.get('userId')?.touched" class="error-message">
            Please select a user
          </div>
        </div>

        <div class="form-group">
            <label for="remarks">
              {{ mode === 'allocate' ? 'Allocation' : 'Return' }} Remarks
            </label>
          <textarea
            id="remarks"
            formControlName="remarks"
            class="form-textarea"
            rows="3"
            placeholder="Optional remarks..."></textarea>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn btn-outline" (click)="onCancel()">
            Cancel
          </button>
          <button type="submit" 
                  class="btn btn-primary"
                  [disabled]="allocationForm.invalid || loading">
            <span *ngIf="loading" class="loading-spinner"></span>
              {{ loading ? 'Processing...' : (mode === 'allocate' ? 'Allocate' : 'Return') }}
          </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-container {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      padding: var(--space-6);
      min-width: 400px;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .dialog-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 var(--space-4) 0;
    }

    .asset-info {
      background: var(--gray-50);
      padding: var(--space-4);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-6);
    }

    .asset-info h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 var(--space-1) 0;
    }

    .asset-tag {
      font-size: 0.875rem;
      color: var(--gray-600);
      margin: 0;
      font-family: var(--font-family-mono);
    }

    .form-group {
      margin-bottom: var(--space-4);
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700);
      margin-bottom: var(--space-2);
    }

    .form-select, .form-textarea {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      transition: all var(--transition-fast);
    }

    .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .form-select.error, .form-textarea.error {
      border-color: var(--error-500);
    }

    .error-message {
      color: var(--error-600);
      font-size: 0.75rem;
      margin-top: var(--space-1);
    }

    .dialog-actions {
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
  `]
})
export class AssetAllocationDialogComponent implements OnInit {
  @Input() asset!: Asset;
  @Input() mode: 'allocate' | 'return' = 'allocate';
  @Input() show = false;
  @Output() close = new EventEmitter<Asset | null>();

  allocationForm: FormGroup;
  users: User[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private assetService: AssetService,
    private toastService: ToastService
  ) {
    this.allocationForm = this.fb.group({
      userId: ['', [Validators.required]],
      remarks: ['']
    });
  }

  ngOnInit() {
    if (this.mode === 'allocate') {
      this.loadUsers();
    }
    
    // Update form validation based on mode
    const userIdControl = this.allocationForm.get('userId');
    if (this.mode === 'return') {
      userIdControl?.clearValidators();
    } else {
      userIdControl?.setValidators([Validators.required]);
    }
    userIdControl?.updateValueAndValidity();
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

      if (this.mode === 'allocate') {
        this.assetService.allocateAsset(
          this.asset.id,
          formData.userId,
          formData.remarks
        ).subscribe({
          next: (result) => {
            this.toastService.success('Asset allocated successfully');
            this.close.emit(result);
          },
          error: (error) => {
            this.toastService.error(error.error?.message || 'Failed to allocate asset');
            this.loading = false;
          }
        });
      } else {
        this.assetService.returnAsset(
          this.asset.id,
          formData.remarks
        ).subscribe({
          next: (result) => {
            this.toastService.success('Asset returned successfully');
            this.close.emit(result);
          },
          error: (error) => {
            this.toastService.error(error.error?.message || 'Failed to return asset');
            this.loading = false;
          }
        });
      }
    }
  }

  onCancel() {
    this.close.emit(null);
  }
}