import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="change-password">
      <div class="header">
        <h2>Change Password</h2>
        <button class="btn btn-secondary" (click)="goBack()">Back</button>
      </div>

      <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <input id="currentPassword" type="password" formControlName="currentPassword" class="form-control">
        </div>

        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input id="newPassword" type="password" formControlName="newPassword" class="form-control">
          <small class="form-text">Minimum 6 characters</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <input id="confirmPassword" type="password" formControlName="confirmPassword" class="form-control">
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid">
            Change Password
          </button>
          <button type="button" class="btn btn-secondary" (click)="goBack()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const userId = this.authService.getCurrentUser()?.id;
      if (!userId) {
        this.toastService.error('User not found');
        return;
      }

      const { currentPassword, newPassword } = this.passwordForm.value;
      
      this.userService.changePassword(userId, currentPassword, newPassword).subscribe({
        next: () => {
          this.toastService.success('Password changed successfully');
          this.goBack();
        },
        error: () => {
          // Error handled by interceptor
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/profile']);
  }
}