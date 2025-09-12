import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="login-form" role="main">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate aria-label="Sign in to your account">
          <fieldset class="form-fieldset">
            <legend class="sr-only">Account credentials</legend>
            
            <div class="form-group">
              <label for="email" class="form-label">Email Address</label>
              <div class="input-with-icon">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-control"
                  [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  placeholder="Enter your email address"
                  autocomplete="email"
                  [attr.aria-describedby]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched ? 'email-error' : null">
              </div>
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
                   id="email-error" 
                   class="error-message" 
                   role="alert">
                <span *ngIf="loginForm.get('email')?.errors?.['required']">Email address is required</span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="input-with-icon">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
                </svg>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  class="form-control"
                  [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  [attr.aria-describedby]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched ? 'password-error' : null">
              </div>
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                   id="password-error" 
                   class="error-message" 
                   role="alert">
                <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
              </div>
            </div>
          </fieldset>

          <div *ngIf="errorMessage" class="error-message login-error" role="alert" aria-live="polite">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
            </svg>
            {{ errorMessage }}
          </div>

          <button type="submit" 
                  class="btn btn-primary btn-block"
                  [disabled]="loginForm.invalid || loading"
                  [attr.aria-label]="loading ? 'Signing in, please wait' : 'Sign in to your account'">
            <span *ngIf="loading" class="loading-spinner" aria-hidden="true"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
      </form>
    </main>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.toastService.success('Login successful!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Invalid email or password';
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}
