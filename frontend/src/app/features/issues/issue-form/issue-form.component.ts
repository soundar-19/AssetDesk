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
  styles: []
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
      title: ['', Validators.required],
      description: ['', Validators.required],
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