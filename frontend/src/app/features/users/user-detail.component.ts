import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models';
import { RoleService } from '../../core/services/role.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { InputModalService } from '../../shared/components/input-modal/input-modal.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-detail-container" *ngIf="user">
      <!-- Header Section -->
      <div class="user-detail-header">
        <div class="user-header-content">
          <div class="user-title-section">
            <div class="user-breadcrumb">
              <button class="user-btn-back" (click)="goBack()">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                Back to Users
              </button>
            </div>
            <h1 class="user-page-title">{{ user.name }}</h1>
            <p class="user-page-description">{{ formatRole(user.role) }} • {{ user.department }} • ID: {{ user.employeeId }}</p>
          </div>
          <div class="user-header-actions" *ngIf="roleService.canManageUsers() || roleService.isAdmin()">
            <button class="user-btn user-btn-outline reset-password" *ngIf="roleService.isAdmin()" (click)="resetPassword()">
              🔑 Reset Password
            </button>
            <button class="user-btn user-btn-outline toggle-status" *ngIf="roleService.isAdmin()" (click)="toggleUserStatus()">
              {{ user.status === 'ACTIVE' ? '🚫 Deactivate' : '✅ Activate' }}
            </button>
            <button class="user-btn user-btn-primary" *ngIf="roleService.canManageUsers()" (click)="editUser()">
              ✏️ Edit User
            </button>
            <button class="user-btn user-btn-danger" *ngIf="roleService.isAdmin()" (click)="deleteUser()">
              🗑️ Delete User
            </button>
          </div>
        </div>
      </div>

      <!-- Content Cards -->
      <div class="content-layout">
        <div class="main-content">
          <div class="info-card">
            <div class="card-header">
              <h3>Personal Information</h3>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-icon">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm8-1a1 1 0 100 2h1a1 1 0 100-2h-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Employee ID</span>
                  <span class="info-value">{{ user.employeeId }}</span>
                </div>
              </div>
              <div class="info-item clickable" (click)="copyToClipboard(user.email)">
                <div class="info-icon">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Email Address</span>
                  <span class="info-value">{{ user.email }}</span>
                </div>
              </div>
              <div class="info-item" [class.clickable]="user.phoneNumber" (click)="user.phoneNumber && copyToClipboard(user.phoneNumber)">
                <div class="info-icon">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Phone Number</span>
                  <span class="info-value">{{ user.phoneNumber || 'Not provided' }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Date Joined</span>
                  <span class="info-value">{{ user.dateJoined | date:'mediumDate' }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon" [class.status-active]="user.status === 'ACTIVE'" [class.status-inactive]="user.status === 'INACTIVE'">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Status</span>
                  <span class="info-value" [class.status-active-text]="user.status === 'ACTIVE'" [class.status-inactive-text]="user.status === 'INACTIVE'">{{ user.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sidebar">
          <div class="actions-card">
            <div class="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div class="actions-list">
              <button class="user-action-item" (click)="viewAssets()">
                <div class="user-action-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="user-action-content">
                  <span class="user-action-title">View Assets</span>
                  <span class="user-action-desc">See assigned assets</span>
                </div>
              </button>
              <button class="user-action-item" (click)="viewHistory()">
                <div class="user-action-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="user-action-content">
                  <span class="user-action-title">View History</span>
                  <span class="user-action-desc">Allocation history</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!user && !loading" class="error-state">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <h2 class="error-title">User not found</h2>
      <p class="error-description">The requested user could not be found or may have been deleted.</p>
      <button class="btn-pro primary" (click)="goBack()">Go Back</button>
    </div>

    <div *ngIf="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading user details...</p>
    </div>
  `,
  styles: [`
    .user-detail-container {
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
      background: var(--gray-50);
      min-height: 100vh;
    }

    .user-detail-header {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      margin-bottom: var(--space-6);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .user-header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
    }

    .user-title-section {
      display: flex;
      flex-direction: column;
    }

    .user-breadcrumb {
      margin-bottom: var(--space-3);
    }

    .user-btn-back {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: var(--gray-100);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      color: var(--gray-700);
      font-size: var(--text-sm);
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .user-btn-back:hover {
      background: var(--gray-200);
    }

    .user-page-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--gray-900);
      margin: 0 0 var(--space-1-5) 0;
      line-height: var(--leading-tight);
    }

    .user-page-description {
      color: var(--gray-600);
      font-size: var(--text-base);
      margin: 0;
      line-height: 1.5;
    }

    .user-header-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2);
      max-width: 300px;
    }

    .user-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-sm);
      font-weight: 500;
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
      text-decoration: none;
      white-space: nowrap;
      font-family: var(--font-family);
    }

    .user-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .user-btn-primary {
      background: var(--primary-600);
      color: white;
      border-color: var(--primary-600);
    }

    .user-btn-primary:hover:not(:disabled) {
      background: var(--primary-700);
      border-color: var(--primary-700);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .user-btn-outline {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
    }

    .user-btn-outline:hover:not(:disabled) {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }

    .user-btn-outline.reset-password {
      background: var(--warning-50);
      color: var(--warning-700);
      border-color: var(--warning-300);
    }

    .user-btn-outline.reset-password:hover:not(:disabled) {
      background: var(--warning-100);
      border-color: var(--warning-400);
    }

    .user-btn-outline.toggle-status {
      background: var(--info-50);
      color: var(--info-700);
      border-color: var(--info-300);
    }

    .user-btn-outline.toggle-status:hover:not(:disabled) {
      background: var(--info-100);
      border-color: var(--info-400);
    }

    .user-btn-danger {
      background: var(--error-600);
      color: white;
      border-color: var(--error-600);
    }

    .user-btn-danger:hover:not(:disabled) {
      background: var(--error-700);
      border-color: var(--error-700);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .status-active {
      background: var(--success-600) !important;
    }

    .status-inactive {
      background: var(--error-600) !important;
    }

    .status-active-text {
      color: var(--success-600) !important;
      font-weight: var(--font-bold) !important;
    }

    .status-inactive-text {
      color: var(--error-600) !important;
      font-weight: var(--font-bold) !important;
    }



    .content-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-6);
    }

    .info-card, .actions-card {
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

    .card-header h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0;
      padding-bottom: var(--space-4);
    }

    .info-grid {
      padding: 0 var(--space-6) var(--space-6) var(--space-6);
      display: grid;
      gap: var(--space-4);
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--gray-25);
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-100);
      transition: var(--transition-fast);
    }

    .info-item.clickable {
      cursor: pointer;
    }

    .info-item.clickable:hover {
      background: var(--gray-50);
      border-color: var(--primary-300);
    }

    .info-icon {
      width: 2rem;
      height: 2rem;
      background: var(--primary-600);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .info-content {
      flex: 1;
    }

    .info-label {
      display: block;
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      color: var(--gray-600);
      margin-bottom: var(--space-1);
    }

    .info-value {
      font-size: var(--text-sm);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
    }

    .actions-list {
      padding: 0 var(--space-6) var(--space-6) var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .user-action-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--gray-25);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: var(--transition-fast);
      text-align: left;
    }

    .user-action-item:hover {
      background: var(--primary-50);
      border-color: var(--primary-300);
    }

    .user-action-icon {
      width: 2.5rem;
      height: 2.5rem;
      background: var(--primary-600);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .user-action-content {
      flex: 1;
    }

    .user-action-title {
      font-size: var(--text-sm);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0 0 var(--space-1) 0;
      display: block;
    }

    .user-action-desc {
      font-size: var(--text-xs);
      color: var(--gray-600);
      margin: 0;
      display: block;
    }

    /* Error and Loading States */
    .error-state, .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-16);
      text-align: center;
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      margin: var(--space-6) auto;
      max-width: 500px;
    }

    .error-icon {
      color: var(--error-500);
      margin-bottom: var(--space-4);
    }

    .error-title {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--gray-900);
      margin: 0 0 var(--space-2) 0;
    }

    .error-description {
      color: var(--gray-600);
      margin: 0 0 var(--space-6) 0;
    }

    .btn-pro {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: var(--transition-fast);
      border: none;
      text-decoration: none;
    }

    .btn-pro.primary {
      background: var(--primary-600);
      color: white;
    }

    .btn-pro.primary:hover {
      background: var(--primary-700);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--gray-200);
      border-top: 3px solid var(--primary-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-4);
    }

    .loading-text {
      color: var(--gray-600);
      font-size: var(--text-sm);
      margin: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .user-detail-container {
        padding: var(--space-4);
      }

      .user-detail-header {
        padding: var(--space-4);
      }

      .user-header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-3);
      }

      .user-header-actions {
        justify-content: flex-start;
      }

      .content-layout {
        grid-template-columns: 1fr;
      }

      .error-state, .loading-state {
        padding: var(--space-8);
        margin: var(--space-4) auto;
      }
    }

    @media (max-width: 480px) {
      .user-detail-container {
        padding: var(--space-3);
      }

      .user-detail-header {
        padding: var(--space-3);
      }

      .user-page-title {
        font-size: var(--text-xl);
      }

      .user-header-actions {
        flex-direction: column;
        gap: var(--space-2);
      }

      .user-btn {
        width: 100%;
        justify-content: center;
        padding: var(--space-2-5);
      }
    }
  `]
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    public roleService: RoleService,
    private toastService: ToastService,
    private inputModalService: InputModalService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(+id);
    }
  }

  loadUser(id: number) {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load user details');
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }

  editUser() {
    if (this.user) {
      this.router.navigate(['/users', this.user.id, 'edit']);
    }
  }

  viewAssets() {
    if (this.user) {
      this.router.navigate(['/users', this.user.id, 'assets']);
    }
  }

  viewHistory() {
    if (this.user) {
      this.router.navigate(['/users', this.user.id, 'allocations']);
    }
  }

  async resetPassword() {
    if (this.user) {
      const newPassword = await this.inputModalService.promptPassword(
        'Reset Password',
        `Enter new password for ${this.user.name}:`,
        6
      );
      
      if (newPassword) {
        this.userService.adminResetPassword(this.user.id, newPassword).subscribe({
          next: () => {
            this.toastService.success('Password reset successfully');
          },
          error: () => {
            this.toastService.error('Failed to reset password');
          }
        });
      }
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  formatRole(role: string): string {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.toastService.success('Copied to clipboard');
    } catch (err) {
      this.toastService.error('Failed to copy to clipboard');
    }
  }

  deleteUser() {
    if (!this.user) return;
    
    this.confirmDialogService.confirmDelete(`user "${this.user.name}"`).subscribe(confirmed => {
      if (confirmed && this.user) {
        this.userService.deleteUser(this.user.id).subscribe({
          next: () => {
            this.toastService.success('User deleted successfully');
            this.router.navigate(['/users']);
          },
          error: () => {
            this.toastService.error('Failed to delete user');
          }
        });
      }
    });
  }

  toggleUserStatus() {
    if (!this.user) return;
    
    const newStatus = this.user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'activate' : 'deactivate';
    
    this.confirmDialogService.confirmAction(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${this.user.name}?`,
      action.charAt(0).toUpperCase() + action.slice(1)
    ).subscribe(confirmed => {
      if (confirmed && this.user) {
        this.userService.updateUserStatus(this.user.id, newStatus).subscribe({
          next: (updatedUser) => {
            this.user = updatedUser;
            this.toastService.success(`User ${action}d successfully`);
          },
          error: () => {
            this.toastService.error(`Failed to ${action} user`);
          }
        });
      }
    });
  }
}