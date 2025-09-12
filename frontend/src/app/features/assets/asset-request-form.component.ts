import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AssetRequestCreate } from '../../core/models';

@Component({
  selector: 'app-asset-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="request-form-container">
      <div class="form-header">
        <h2>Request Asset</h2>
        <p>Submit a request for a new asset or replacement</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="request-form">
        <div class="form-group">
          <label for="requestType">Request Type *</label>
          <select id="requestType" [(ngModel)]="request.requestType" name="requestType" required class="form-control">
            <option value="">Select request type</option>
            <option value="NEW">New Asset</option>
            <option value="REPLACEMENT">Replacement</option>
          </select>
        </div>

        <div class="form-group">
          <label for="category">Category *</label>
          <select id="category" [(ngModel)]="request.requestedCategory" name="category" required class="form-control">
            <option value="">Select category</option>
            <option value="HARDWARE">Hardware</option>
            <option value="SOFTWARE">Software</option>
            <option value="ACCESSORIES">Accessories</option>
          </select>
        </div>

        <div class="form-group">
          <label for="type">Asset Type</label>
          <select id="type" [(ngModel)]="request.requestedType" name="type" class="form-control">
            <option value="">Select type</option>
            <option value="LAPTOP">Laptop</option>
            <option value="DESKTOP">Desktop</option>
            <option value="MONITOR">Monitor</option>
            <option value="KEYBOARD">Keyboard</option>
            <option value="MOUSE">Mouse</option>
            <option value="LICENSE">License</option>
          </select>
        </div>

        <div class="form-group">
          <label for="model">Preferred Model/Brand</label>
          <input id="model" type="text" [(ngModel)]="request.requestedModel" name="model" 
                 placeholder="e.g., Dell Latitude 5520" class="form-control">
        </div>

        <div class="form-group">
          <label for="justification">Justification *</label>
          <textarea id="justification" [(ngModel)]="request.justification" name="justification" 
                    required rows="4" placeholder="Please explain why you need this asset..."
                    class="form-control"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" (click)="cancel()" class="btn btn-outline">Cancel</button>
          <button type="submit" [disabled]="submitting" class="btn btn-primary">
            {{ submitting ? 'Submitting...' : 'Submit Request' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .request-form-container {
      max-width: 600px;
      margin: 0 auto;
      padding: var(--space-6);
    }

    .form-header {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .form-header h2 {
      color: var(--gray-900);
      margin-bottom: var(--space-2);
    }

    .form-header p {
      color: var(--gray-600);
    }

    .request-form {
      background: white;
      padding: var(--space-8);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .form-group {
      margin-bottom: var(--space-6);
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: var(--gray-700);
      margin-bottom: var(--space-2);
    }

    .form-control {
      width: 100%;
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

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .form-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
      margin-top: var(--space-8);
    }

    .btn {
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .btn-primary {
      background: var(--primary-600);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-700);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-outline {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
    }

    .btn-outline:hover {
      background: var(--gray-50);
    }
  `]
})
export class AssetRequestFormComponent {
  request: AssetRequestCreate = {
    requestType: 'NEW',
    requestedCategory: '',
    requestedType: '',
    requestedModel: '',
    justification: ''
  };
  
  submitting = false;

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.request.requestType || !this.request.requestedCategory || !this.request.justification) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    this.submitting = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.toastService.error('User not authenticated');
      this.submitting = false;
      return;
    }

    this.requestService.create(currentUser.id, this.request).subscribe({
      next: () => {
        this.toastService.success('Asset request submitted successfully');
        this.router.navigate(['/asset-requests']);
      },
      error: (error) => {
        console.error('Error submitting request:', error);
        this.toastService.error('Failed to submit request');
        this.submitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/asset-requests']);
  }
}