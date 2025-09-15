import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="user-form-pro">
      <div class="page-header-pro">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">{{ isEditMode ? 'Edit User' : 'Create New User' }}</h1>
            <p class="page-subtitle">{{ isEditMode ? 'Update user information and system permissions' : 'Add a new user to the asset management system' }}</p>
          </div>
          <div class="header-actions">
            <button class="btn-pro outline" (click)="goBack()" type="button">
              <svg class="btn-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              Back to Users
            </button>
          </div>
        </div>
      </div>

      <div class="content-section">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="form-pro" novalidate>
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">
                <svg class="title-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                Personal Information
              </h2>
            </div>
            <div class="card-content">
              <div class="form-grid">
                <div class="form-group">
                  <label for="employeeId" class="form-label required">
                    <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm8-1a1 1 0 100 2h1a1 1 0 100-2h-1z" clip-rule="evenodd" />
                    </svg>
                    Employee ID
                  </label>
                  <input
                    id="employeeId"
                    type="text"
                    formControlName="employeeId"
                    class="form-input"
                    [class.error]="userForm.get('employeeId')?.invalid && userForm.get('employeeId')?.touched"
                    placeholder="Enter unique employee ID">
                  <div *ngIf="userForm.get('employeeId')?.invalid && userForm.get('employeeId')?.touched" class="form-error">
                    <svg class="error-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Employee ID is required
                  </div>
                </div>

                <div class="form-group">
                  <label for="name" class="form-label required">
                    <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    formControlName="name"
                    class="form-input"
                    [class.error]="userForm.get('name')?.invalid && userForm.get('name')?.touched"
                    placeholder="Enter full name">
                  <div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" class="form-error">
                    <svg class="error-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Full name is required
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">
                <svg class="title-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                Contact Information
              </h2>
            </div>
            <div class="card-content">
              <div class="form-grid">
                <div class="form-group">
                  <label for="email" class="form-label required">
                    <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="form-input"
                    [class.error]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                    placeholder="Enter email address">
                  <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="form-error">
                    <svg class="error-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span *ngIf="userForm.get('email')?.errors?.['required']">Email is required</span>
                    <span *ngIf="userForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="phoneNumber" class="form-label optional">
                    <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    formControlName="phoneNumber"
                    class="form-input"
                    placeholder="Enter phone number (optional)">
                </div>
              </div>
            </div>
          </div>

          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">
                <svg class="title-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Role & Department
              </h2>
            </div>
            <div class="card-content">
              <div class="form-grid">
                <div class="form-group">
                  <label for="role" class="form-label required">
                    <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    System Role
                  </label>
                  <select id="role" formControlName="role" class="form-select">
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="IT_SUPPORT">IT Support</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="status" class="form-label required">
                    <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Account Status
                  </label>
                  <select id="status" formControlName="status" class="form-select">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="department" class="form-label optional">
                    <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 6a2 2 0 11-4 0 2 2 0 014 0zm7.938-1.72a.75.75 0 00-1.376.64 3.501 3.501 0 010 2.16.75.75 0 101.376.64 5.001 5.001 0 000-3.44z" clip-rule="evenodd" />
                    </svg>
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    formControlName="department"
                    class="form-input"
                    placeholder="Enter department name">
                </div>

                <div class="form-group">
                  <label for="designation" class="form-label optional">
                    <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                    </svg>
                    Job Title
                  </label>
                  <input
                    id="designation"
                    type="text"
                    formControlName="designation"
                    class="form-input"
                    placeholder="Enter job title or designation">
                </div>
              </div>
            </div>
          </div>

          <div class="form-card" *ngIf="!isEditMode">
            <div class="card-header">
              <h2 class="card-title">
                <svg class="title-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                Security Settings
              </h2>
            </div>
            <div class="card-content">
              <div class="form-group">
                <label for="password" class="form-label required">
                  <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                  Initial Password
                </label>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  class="form-input"
                  [class.error]="userForm.get('password')?.invalid && userForm.get('password')?.touched"
                  placeholder="Enter initial password">
                <div class="form-help">
                  <svg class="help-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  Password must be at least 6 characters long. User can change it after first login.
                </div>
                <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="form-error">
                  <svg class="error-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span *ngIf="userForm.get('password')?.errors?.['required']">Password is required</span>
                  <span *ngIf="userForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-pro outline" (click)="goBack()">
              <svg class="btn-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              Cancel
            </button>
            <button type="submit" class="btn-pro primary" [disabled]="userForm.invalid || loading">
              <svg *ngIf="!loading" class="btn-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <div *ngIf="loading" class="loading-spinner-small"></div>
              {{ loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .user-form-pro {
      padding: var(--space-4);
      max-width: 1000px;
      margin: 0 auto;
      min-height: 100vh;
    }

    .page-header-pro {
      margin-bottom: var(--space-6);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-4);
    }

    .title-section h1 {
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0 0 var(--space-1) 0;
    }

    .title-section p {
      color: var(--gray-600);
      font-size: var(--text-sm);
      margin: 0;
    }

    .header-actions .btn-pro {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: var(--transition-fast);
      text-decoration: none;
      border: none;
    }

    .btn-pro.outline {
      background: white;
      border: 1px solid var(--gray-300);
      color: var(--gray-700);
    }

    .btn-pro.outline:hover {
      background: var(--gray-50);
    }

    .form-pro {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .form-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .card-header {
      padding: var(--space-6) var(--space-6) 0 var(--space-6);
      border-bottom: 1px solid var(--gray-200);
      margin-bottom: var(--space-6);
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0;
      padding-bottom: var(--space-4);
    }

    .title-icon {
      color: var(--primary-600);
    }

    .card-content {
      padding: 0 var(--space-6) var(--space-6) var(--space-6);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-4);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--gray-700);
    }

    .form-label.required::after {
      content: '*';
      color: var(--error-500);
      margin-left: var(--space-1);
    }

    .form-label.optional {
      color: var(--gray-600);
    }

    .label-icon {
      color: var(--gray-400);
    }

    .form-input, .form-select {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      transition: var(--transition-fast);
      background: white;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .form-input.error, .form-select.error {
      border-color: var(--error-500);
      box-shadow: 0 0 0 3px var(--error-100);
    }

    .form-select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right var(--space-3) center;
      background-repeat: no-repeat;
      background-size: 16px 12px;
      padding-right: 2.5rem;
      cursor: pointer;
    }

    .form-help {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      font-size: var(--text-xs);
      color: var(--gray-600);
      line-height: var(--leading-relaxed);
    }

    .help-icon {
      color: var(--gray-400);
      flex-shrink: 0;
      margin-top: 0.1rem;
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-xs);
      color: var(--error-600);
    }

    .error-icon {
      flex-shrink: 0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-6);
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .btn-pro.primary {
      background: var(--primary-600);
      color: white;
    }

    .btn-pro.primary:hover:not(:disabled) {
      background: var(--primary-700);
      transform: translateY(-1px);
    }

    .btn-pro.primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner-small {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .user-form-pro {
        padding: var(--space-3);
      }
      
      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-3);
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
        gap: var(--space-2);
      }
    }
  `]
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.userForm = this.fb.group({
      employeeId: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      role: ['EMPLOYEE', Validators.required],
      department: [''],
      designation: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.loadUser(this.userId);
    }
  }

  loadUser(id: number) {
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue(user);
      },
      error: () => {
        this.toastService.error('Failed to load user');
        this.goBack();
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading = true;
      const userData = this.userForm.value;
      
      const request = this.isEditMode 
        ? this.userService.updateUser(this.userId!, userData)
        : this.userService.createUser(userData);

      request.subscribe({
        next: () => {
          this.toastService.success(`User ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.loading = false;
          this.goBack();
        },
        error: () => {
          this.toastService.error(`Failed to ${this.isEditMode ? 'update' : 'create'} user`);
          this.loading = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}