import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models';
import { RoleService } from '../../core/services/role.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { InputModalService } from '../../shared/components/input-modal/input-modal.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-detail-container" *ngIf="user">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-nav">
          <button class="btn-back" (click)="goBack()">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back to Users
          </button>
        </div>
        
        <div class="user-profile-section">
          <div class="profile-main">
            <div class="avatar-container">
              <div class="user-avatar" [class]="'status-' + user.status.toLowerCase()">
                <span>{{ getInitials(user.name) }}</span>
              </div>
              <div class="status-indicator" [class]="'indicator-' + user.status.toLowerCase()"></div>
            </div>
            <div class="user-details">
              <div class="name-section">
                <h1 class="user-name">{{ user.name }}</h1>
                <div class="status-badges">
                  <span class="badge" [class]="'badge-' + user.status.toLowerCase()">{{ user.status }}</span>
                  <span class="badge badge-role">{{ formatRole(user.role) }}</span>
                </div>
              </div>
              <div class="role-info">
                <p class="user-role">{{ user.designation || formatRole(user.role) }}</p>
                <p class="user-id">ID: {{ user.employeeId }}</p>
              </div>
              <div class="contact-info">
                <span class="contact-item" (click)="copyToClipboard(user.email)">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  {{ user.email }}
                </span>
                <span class="contact-item" *ngIf="user.department">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 6a2 2 0 11-4 0 2 2 0 014 0zm7.938-1.72a.75.75 0 00-1.376.64 3.501 3.501 0 010 2.16.75.75 0 101.376.64 5.001 5.001 0 000-3.44z" clip-rule="evenodd" />
                  </svg>
                  {{ user.department }}
                </span>
              </div>
            </div>
          </div>
          <div class="profile-actions" *ngIf="roleService.canManageUsers() || roleService.isAdmin()">
            <button class="action-btn primary" *ngIf="roleService.canManageUsers()" (click)="editUser()">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit User
            </button>
            <button class="action-btn secondary" *ngIf="roleService.isAdmin()" (click)="resetPassword()">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              Reset Password
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
            </div>
          </div>
        </div>
        
        <div class="sidebar">
          <div class="actions-card">
            <div class="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div class="actions-list">
              <button class="action-item" (click)="viewAssets()">
                <div class="action-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="action-content">
                  <span class="action-title">View Assets</span>
                  <span class="action-desc">See assigned assets</span>
                </div>
              </button>
              <button class="action-item" (click)="viewHistory()">
                <div class="action-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="action-content">
                  <span class="action-title">View History</span>
                  <span class="action-desc">Allocation history</span>
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

    .page-header {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      margin-bottom: var(--space-6);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .header-nav {
      margin-bottom: var(--space-3);
    }

    .btn-back {
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

    .btn-back:hover {
      background: var(--gray-200);
    }

    .user-profile-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .profile-main {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      flex: 1;
      min-width: 0;
    }

    .profile-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      flex-shrink: 0;
      align-self: flex-start;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: var(--transition-fast);
      border: none;
      white-space: nowrap;
    }

    .action-btn.primary {
      background: var(--primary-600);
      color: white;
    }

    .action-btn.primary:hover {
      background: var(--primary-700);
    }

    .action-btn.secondary {
      background: var(--warning-600);
      color: white;
    }

    .action-btn.secondary:hover {
      background: var(--warning-700);
    }

    .avatar-container {
      position: relative;
    }

    .user-avatar {
      width: 5rem;
      height: 5rem;
      border-radius: 50%;
      background: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      border: 3px solid white;
      box-shadow: var(--shadow-md);
    }

    .user-avatar.status-inactive {
      background: var(--gray-400);
    }

    .status-indicator {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;
    }

    .indicator-active {
      background: var(--success-500);
    }

    .indicator-inactive {
      background: var(--gray-400);
    }

    .user-details {
      flex: 1;
    }

    .name-section {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-1);
    }

    .user-name {
      font-size: var(--text-3xl);
      font-weight: var(--font-bold);
      color: var(--gray-900);
      margin: 0;
    }

    .status-badges {
      display: flex;
      gap: var(--space-2);
    }

    .role-info {
      margin-bottom: var(--space-2);
    }

    .user-role {
      font-size: var(--text-lg);
      color: var(--gray-600);
      margin: 0;
    }

    .user-id {
      font-size: var(--text-sm);
      color: var(--gray-500);
      font-weight: var(--font-medium);
      margin: 0;
    }

    .contact-info {
      display: flex;
      gap: var(--space-3);
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--gray-600);
      cursor: pointer;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      transition: var(--transition-fast);
    }

    .contact-item:hover {
      background: var(--gray-100);
      color: var(--primary-600);
    }

    .badge {
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      text-transform: uppercase;
    }

    .badge-active {
      background: var(--success-100);
      color: var(--success-700);
    }

    .badge-inactive {
      background: var(--error-100);
      color: var(--error-700);
    }

    .badge-role {
      background: var(--primary-100);
      color: var(--primary-700);
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

    .action-item {
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

    .action-item:hover {
      background: var(--primary-50);
      border-color: var(--primary-300);
    }

    .action-icon {
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

    .action-content {
      flex: 1;
    }

    .action-title {
      font-size: var(--text-sm);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0 0 var(--space-1) 0;
    }

    .action-desc {
      font-size: var(--text-xs);
      color: var(--gray-600);
      margin: 0;
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

    @media (max-width: 1024px) {
      .user-profile-section {
        gap: var(--space-3);
      }
      
      .profile-main {
        gap: var(--space-4);
      }
    }

    @media (max-width: 768px) {
      .user-detail-container {
        padding: var(--space-4);
      }

      .page-header {
        padding: var(--space-4);
      }

      .user-profile-section {
        flex-direction: column;
        gap: var(--space-4);
        align-items: stretch;
      }

      .profile-main {
        flex-direction: column;
        text-align: center;
        gap: var(--space-4);
        align-items: center;
      }

      .user-details {
        width: 100%;
        max-width: 400px;
      }

      .name-section {
        flex-direction: column;
        gap: var(--space-2);
        align-items: center;
      }

      .contact-info {
        flex-direction: column;
        gap: var(--space-2);
        align-items: center;
      }

      .profile-actions {
        flex-direction: row;
        justify-content: center;
        width: 100%;
      }

      .action-btn {
        flex: 1;
        justify-content: center;
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

      .page-header {
        padding: var(--space-3);
      }

      .user-name {
        font-size: var(--text-2xl);
      }

      .profile-actions {
        flex-direction: column;
        gap: var(--space-2);
      }

      .action-btn {
        padding: var(--space-2) var(--space-3);
        font-size: var(--text-xs);
      }

      .contact-item {
        font-size: var(--text-xs);
        padding: var(--space-2);
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
    private inputModalService: InputModalService
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
}