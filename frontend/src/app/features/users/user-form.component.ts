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
    <main class="page-container" role="main">
      <div class="form-container">
        <div class="form-header">
          <div>
            <h1 class="form-title">{{ isEditMode ? 'Edit User' : 'Add User' }}</h1>
            <p class="form-subtitle">{{ isEditMode ? 'Update user information and permissions' : 'Create a new user account in the system' }}</p>
          </div>
          <button class="btn btn-outline" (click)="goBack()" type="button">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back
          </button>
        </div>

        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="form" novalidate>
          <div class="form-section">
            <h2 class="section-title">Basic Information</h2>
            <div class="form-grid grid-2">
              <div class="form-group">
                <label for="employeeId" class="form-label required">Employee ID</label>
                <input
                  id="employeeId"
                  type="text"
                  formControlName="employeeId"
                  class="form-control"
                  [class.error]="userForm.get('employeeId')?.invalid && userForm.get('employeeId')?.touched"
                  placeholder="Enter employee ID">
                <div *ngIf="userForm.get('employeeId')?.invalid && userForm.get('employeeId')?.touched" class="form-error">
                  Employee ID is required
                </div>
              </div>

              <div class="form-group">
                <label for="name" class="form-label required">Full Name</label>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  class="form-control"
                  [class.error]="userForm.get('name')?.invalid && userForm.get('name')?.touched"
                  placeholder="Enter full name">
                <div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" class="form-error">
                  Name is required
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title">Contact Information</h2>
            <div class="form-grid grid-2">
              <div class="form-group">
                <label for="email" class="form-label required">Email Address</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="form-control"
                    [class.error]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                    placeholder="Enter email address">
                </div>
                <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="form-error">
                  <span *ngIf="userForm.get('email')?.errors?.['required']">Email is required</span>
                  <span *ngIf="userForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
                </div>
              </div>

              <div class="form-group">
                <label for="phoneNumber" class="form-label optional">Phone Number</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <input
                    id="phoneNumber"
                    type="tel"
                    formControlName="phoneNumber"
                    class="form-control"
                    placeholder="Enter phone number">
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title">Role & Department</h2>
            <div class="form-grid grid-2">
              <div class="form-group">
                <label for="role" class="form-label required">Role</label>
                <select id="role" formControlName="role" class="form-control">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="IT_SUPPORT">IT Support</option>
                </select>
              </div>

              <div class="form-group">
                <label for="status" class="form-label required">Status</label>
                <select id="status" formControlName="status" class="form-control">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div class="form-grid grid-2">
              <div class="form-group">
                <label for="department" class="form-label optional">Department</label>
                <input
                  id="department"
                  type="text"
                  formControlName="department"
                  class="form-control"
                  placeholder="Enter department">
              </div>

              <div class="form-group">
                <label for="designation" class="form-label optional">Designation</label>
                <input
                  id="designation"
                  type="text"
                  formControlName="designation"
                  class="form-control"
                  placeholder="Enter job title">
              </div>
            </div>
          </div>

          <div class="form-section" *ngIf="!isEditMode">
            <h2 class="section-title">Security</h2>
            <div class="form-grid grid-1">
              <div class="form-group">
                <label for="password" class="form-label required">Password</label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                  <input
                    id="password"
                    type="password"
                    formControlName="password"
                    class="form-control"
                    [class.error]="userForm.get('password')?.invalid && userForm.get('password')?.touched"
                    placeholder="Enter password">
                </div>
                <div class="form-help">Password must be at least 6 characters long</div>
                <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="form-error">
                  <span *ngIf="userForm.get('password')?.errors?.['required']">Password is required</span>
                  <span *ngIf="userForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="goBack()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid || loading">
              <span *ngIf="loading" class="loading-spinner"></span>
              {{ loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User') }}
            </button>
          </div>
        </form>
      </div>
    </main>
  `,
  styles: []
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