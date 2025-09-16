import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IssueService } from '../../../core/services/issue.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="page-container" role="main">
      <div class="form-container">
        <div class="form-header">
          <div>
            <h1 class="form-title">{{ isEditMode ? 'Edit Issue' : 'Report Issue' }}</h1>
            <p class="form-subtitle">{{ isEditMode ? 'Update issue details and status' : 'Report a problem with an asset' }}</p>
          </div>
          <button class="btn btn-outline" (click)="goBack()" type="button">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back
          </button>
        </div>

        <form [formGroup]="issueForm" (ngSubmit)="onSubmit()" class="form" novalidate>
          <div class="form-section">
            <h2 class="section-title">Issue Details</h2>
            <div class="form-grid grid-1">
              <div class="form-group">
                <label for="title" class="form-label required">Issue Title</label>
                <input
                  id="title"
                  type="text"
                  formControlName="title"
                  class="form-control"
                  [class.error]="issueForm.get('title')?.invalid && issueForm.get('title')?.touched"
                  placeholder="Enter a brief description of the issue">
                <div *ngIf="issueForm.get('title')?.invalid && issueForm.get('title')?.touched" class="form-error">
                  Issue title is required
                </div>
              </div>

              <div class="form-group">
                <label for="description" class="form-label required">Description</label>
                <textarea
                  id="description"
                  formControlName="description"
                  class="form-control"
                  [class.error]="issueForm.get('description')?.invalid && issueForm.get('description')?.touched"
                  rows="4"
                  placeholder="Provide detailed information about the issue, including steps to reproduce if applicable"></textarea>
                <div *ngIf="issueForm.get('description')?.invalid && issueForm.get('description')?.touched" class="form-error">
                  Description is required
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title">Classification</h2>
            <div class="form-grid grid-2">
              <div class="form-group">
                <label for="type" class="form-label required">Issue Type</label>
                <select id="type" formControlName="type" class="form-control">
                  <option value="HARDWARE_MALFUNCTION">Hardware Malfunction</option>
                  <option value="SOFTWARE_ISSUE">Software Issue</option>
                  <option value="PERFORMANCE_PROBLEM">Performance Problem</option>
                  <option value="DAMAGE">Physical Damage</option>
                  <option value="MISSING_PARTS">Missing Parts</option>
                  <option value="CONNECTIVITY_ISSUE">Connectivity Issue</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label for="priority" class="form-label required">Priority Level</label>
                <select id="priority" formControlName="priority" class="form-control">
                  <option value="LOW">Low - Minor issue, no immediate impact</option>
                  <option value="MEDIUM">Medium - Moderate impact on productivity</option>
                  <option value="HIGH">High - Significant impact, needs attention</option>
                  <option value="CRITICAL">Critical - System down, urgent fix needed</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="goBack()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="issueForm.invalid || loading">
              <span *ngIf="loading" class="loading-spinner"></span>
              {{ loading ? 'Submitting...' : (isEditMode ? 'Update Issue' : 'Report Issue') }}
            </button>
          </div>
        </form>
      </div>
    </main>
  `,
  styles: [`
    .page-container {
      padding: var(--space-6);
      max-width: 800px;
      margin: 0 auto;
    }

    .form-container {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--space-6);
      border-bottom: 1px solid var(--gray-200);
      background: var(--gray-50);
    }

    .form-title {
      margin: 0 0 var(--space-1) 0;
      color: var(--gray-900);
      font-size: 1.5rem;
      font-weight: 700;
    }

    .form-subtitle {
      margin: 0;
      color: var(--gray-600);
      font-size: 0.875rem;
    }

    .form {
      padding: var(--space-6);
    }

    .form-section {
      margin-bottom: var(--space-8);
    }

    .section-title {
      margin: 0 0 var(--space-4) 0;
      color: var(--gray-900);
      font-size: 1.125rem;
      font-weight: 600;
      border-bottom: 1px solid var(--gray-200);
      padding-bottom: var(--space-2);
    }

    .form-grid {
      display: grid;
      gap: var(--space-4);
    }

    .grid-1 {
      grid-template-columns: 1fr;
    }

    .grid-2 {
      grid-template-columns: 1fr 1fr;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-weight: 500;
      color: var(--gray-700);
      margin-bottom: var(--space-2);
      font-size: 0.875rem;
    }

    .form-label.required::after {
      content: ' *';
      color: var(--error-500);
    }

    .form-control {
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

    .form-control.error {
      border-color: var(--error-500);
      box-shadow: 0 0 0 3px var(--error-100);
    }

    .form-control:disabled {
      background: var(--gray-100);
      color: var(--gray-500);
      cursor: not-allowed;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .form-error {
      color: var(--error-600);
      font-size: 0.75rem;
      margin-top: var(--space-1);
    }

    .form-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
      padding-top: var(--space-6);
      border-top: 1px solid var(--gray-200);
      margin-top: var(--space-6);
    }

    .btn {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
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
      box-shadow: var(--shadow-md);
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
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .page-container {
        padding: var(--space-4);
      }

      .form-header {
        flex-direction: column;
        gap: var(--space-4);
        align-items: stretch;
      }

      .form {
        padding: var(--space-4);
      }

      .grid-2 {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .btn {
        justify-content: center;
      }
    }
  `]
})
export class IssueFormComponent implements OnInit {
  issueForm: FormGroup;
  isEditMode = false;
  issueId: number | null = null;
  assetId: number | null = null;
  assetInfo: any = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private issueService: IssueService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.issueForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['HARDWARE_MALFUNCTION', Validators.required],
      priority: ['MEDIUM', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Route ID:', id, 'URL:', this.route.snapshot.url);
    
    if (id && this.route.snapshot.url[2]?.path === 'issue') {
      // This is asset issue reporting
      this.assetId = +id;
      console.log('Asset ID set to:', this.assetId);
      this.loadAssetInfo();
    } else if (id) {
      // This is issue editing
      this.isEditMode = true;
      this.issueId = +id;
      this.loadIssue(this.issueId);
    }
  }

  loadIssue(id: number) {
    this.issueService.getIssueById(id).subscribe({
      next: (issue) => {
        this.issueForm.patchValue(issue);
      },
      error: () => {
        this.toastService.error('Failed to load issue');
        this.goBack();
      }
    });
  }

  onSubmit() {
    if (this.issueForm.valid) {
      this.loading = true;
      const issueData = this.issueForm.value;
      
      if (!this.isEditMode && !this.assetId) {
        this.toastService.error('Asset ID is required to report an issue');
        this.loading = false;
        return;
      }

      console.log('Submitting issue:', issueData);
      console.log('Asset ID:', this.assetId);
      console.log('User ID:', this.authService.getCurrentUser()?.id);

      const request = this.isEditMode 
        ? this.issueService.updateIssue(this.issueId!, { ...issueData, assetId: this.assetId! })
        : this.issueService.createIssue({ ...issueData, assetId: this.assetId! }, this.authService.getCurrentUser()?.id || 1);

      request.subscribe({
        next: (response) => {
          console.log('Issue created/updated successfully:', response);
          this.toastService.success(`Issue ${this.isEditMode ? 'updated' : 'reported'} successfully`);
          this.loading = false;
          this.goBack();
        },
        error: (error) => {
          console.error('Error creating/updating issue:', error);
          this.toastService.error(`Failed to ${this.isEditMode ? 'update' : 'report'} issue: ${error.error?.message || error.message}`);
          this.loading = false;
        }
      });
    } else {
      console.log('Form is invalid:', this.issueForm.errors);
      Object.keys(this.issueForm.controls).forEach(key => {
        const control = this.issueForm.get(key);
        if (control && control.invalid) {
          console.log(`${key} is invalid:`, control.errors);
        }
      });
    }
  }

  loadAssetInfo() {
    // Load asset information to show context
    // For now, just proceed with the form
  }

  goBack() {
    if (this.assetId) {
      this.router.navigate(['/assets']);
    } else {
      this.router.navigate(['/issues']);
    }
  }
}