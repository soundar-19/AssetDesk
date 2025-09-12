import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Asset, User } from '../../../core/models';
import { AssetService } from '../../../core/services/asset.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-asset-allocation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-overlay" *ngIf="show" (click)="onOverlayClick($event)">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>{{ mode === 'allocate' ? 'Allocate Asset' : 'Return Asset' }}</h3>
          <button class="close-btn" (click)="closeDialog()">&times;</button>
        </div>
        
        <div class="dialog-body">
          <div class="asset-info">
            <h4>{{ asset?.name }}</h4>
            <div class="asset-details">
              <span class="asset-tag">{{ asset?.assetTag }}</span>
              <span class="asset-status" [class]="'status-' + asset?.status?.toLowerCase()">
                {{ asset?.status }}
              </span>
            </div>
          </div>
          
          <div class="allocation-form" *ngIf="mode === 'allocate'">
            <div class="form-group">
              <label for="userId">Select User *</label>
              <select id="userId" 
                      class="form-control" 
                      [(ngModel)]="selectedUserId" 
                      [disabled]="loading">
                <option value="">Choose a user...</option>
                <option *ngFor="let user of users" [value]="user.id">
                  {{ user.name }} ({{ user.email }}) - {{ user.department }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="remarks">Allocation Remarks</label>
              <textarea id="remarks" 
                        class="form-control" 
                        [(ngModel)]="remarks" 
                        placeholder="Optional remarks for this allocation..."
                        rows="3"
                        [disabled]="loading"></textarea>
            </div>
          </div>
          
          <div class="return-form" *ngIf="mode === 'return'">
            <div class="current-allocation" *ngIf="asset?.allocatedTo">
              <h5>Currently Allocated To:</h5>
              <div class="user-info">
                <div class="user-name">{{ asset?.allocatedTo?.name }}</div>
                <div class="user-email">{{ asset?.allocatedTo?.email }}</div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="returnRemarks">Return Remarks</label>
              <textarea id="returnRemarks" 
                        class="form-control" 
                        [(ngModel)]="remarks" 
                        placeholder="Optional remarks for returning this asset..."
                        rows="3"
                        [disabled]="loading"></textarea>
            </div>
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="btn btn-secondary" (click)="closeDialog()" [disabled]="loading">
            Cancel
          </button>
          <button class="btn btn-primary" 
                  (click)="confirm()" 
                  [disabled]="loading || (mode === 'allocate' && !selectedUserId)">
            <span *ngIf="loading" class="loading-spinner"></span>
            {{ mode === 'allocate' ? 'Allocate' : 'Return' }}
          </button>
        </div>
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
      animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .dialog-content {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from { transform: translateY(-20px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-6);
      border-bottom: 1px solid var(--gray-200);
      background: var(--gray-50);
    }
    
    .dialog-header h3 {
      margin: 0;
      color: var(--gray-900);
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--gray-500);
      cursor: pointer;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }
    
    .close-btn:hover {
      background: var(--gray-200);
      color: var(--gray-700);
    }
    
    .dialog-body {
      padding: var(--space-6);
      max-height: 60vh;
      overflow-y: auto;
    }
    
    .asset-info {
      margin-bottom: var(--space-6);
      padding: var(--space-4);
      background: var(--gray-50);
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
    }
    
    .asset-info h4 {
      margin: 0 0 var(--space-2) 0;
      color: var(--gray-900);
      font-size: 1.125rem;
      font-weight: 600;
    }
    
    .asset-details {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }
    
    .asset-tag {
      background: var(--gray-100);
      color: var(--gray-700);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-family: var(--font-family-mono);
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .asset-status {
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    .status-available {
      background: var(--success-100);
      color: var(--success-700);
    }
    
    .status-allocated {
      background: var(--primary-100);
      color: var(--primary-700);
    }
    
    .status-maintenance {
      background: var(--warning-100);
      color: var(--warning-700);
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
      transition: border-color var(--transition-fast);
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
    
    .current-allocation {
      margin-bottom: var(--space-5);
      padding: var(--space-4);
      background: var(--primary-50);
      border-radius: var(--radius-md);
      border: 1px solid var(--primary-200);
    }
    
    .current-allocation h5 {
      margin: 0 0 var(--space-2) 0;
      color: var(--primary-700);
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    .user-info .user-name {
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: var(--space-1);
    }
    
    .user-info .user-email {
      color: var(--gray-600);
      font-size: 0.875rem;
    }
    
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-6);
      border-top: 1px solid var(--gray-200);
      background: var(--gray-50);
    }
    
    .btn {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background: white;
      color: var(--gray-700);
      border: 1px solid var(--gray-300);
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }
    
    .btn-primary {
      background: var(--primary-600);
      color: white;
      border: 1px solid var(--primary-600);
    }
    
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-700);
      border-color: var(--primary-700);
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
    
    @media (max-width: 640px) {
      .dialog-content {
        width: 95%;
        margin: var(--space-4);
      }
      
      .dialog-header,
      .dialog-body,
      .dialog-footer {
        padding: var(--space-4);
      }
    }
  `]
})
export class AssetAllocationDialogComponent implements OnInit {
  @Input() asset: Asset | null = null;
  @Input() mode: 'allocate' | 'return' = 'allocate';
  @Input() show = false;
  @Output() close = new EventEmitter<Asset | null>();
  
  closeDialog() {
    this.close.emit(null);
  }
  
  users: User[] = [];
  selectedUserId: number | null = null;
  remarks = '';
  loading = false;
  
  constructor(
    private assetService: AssetService,
    private userService: UserService,
    private toastService: ToastService
  ) {}
  
  ngOnInit() {
    if (this.mode === 'allocate') {
      this.loadUsers();
    }
  }
  
  loadUsers() {
    this.userService.getActiveUsers(0, 100).subscribe({
      next: (response) => {
        this.users = response.content || [];
      },
      error: () => {
        this.toastService.error('Failed to load users');
      }
    });
  }
  
  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close.emit(null);
    }
  }
  
  confirm() {
    if (!this.asset) return;
    
    this.loading = true;
    
    if (this.mode === 'allocate') {
      if (!this.selectedUserId) {
        this.toastService.error('Please select a user');
        this.loading = false;
        return;
      }
      
      this.assetService.allocateAsset(this.asset.id, this.selectedUserId, this.remarks).subscribe({
        next: (updatedAsset) => {
          this.toastService.success('Asset allocated successfully');
          this.loading = false;
          this.close.emit(updatedAsset);
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Failed to allocate asset');
          this.loading = false;
        }
      });
    } else {
      this.assetService.returnAsset(this.asset.id, this.remarks).subscribe({
        next: (updatedAsset) => {
          this.toastService.success('Asset returned successfully');
          this.loading = false;
          this.close.emit(updatedAsset);
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Failed to return asset');
          this.loading = false;
        }
      });
    }
  }
}