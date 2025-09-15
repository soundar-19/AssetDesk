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
    <div class="user-detail-pro" *ngIf="user">
      <div class="page-header-pro">
        <div class="header-content">
          <div class="user-profile">
            <div class="user-avatar-large">
              <span class="avatar-text">{{ getInitials(user.name) }}</span>
            </div>
            <div class="user-info">
              <h1 class="user-name">{{ user.name }}</h1>
              <p class="user-title">{{ user.designation || user.role }}</p>
              <div class="user-badges">
                <span class="status-badge" [class]="'status-' + user.status.toLowerCase()">{{ user.status }}</span>
                <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">{{ user.role }}</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-pro outline" (click)="goBack()">
              <svg class="btn-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              Back
            </button>
            <button *ngIf="roleService.canManageUsers()" class="btn-pro primary" (click)="editUser()">
              <svg class="btn-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit User
            </button>
            <button *ngIf="roleService.isAdmin()" class="btn-pro warning" (click)="resetPassword()">
              <svg class="btn-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              Reset Password
            </button>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="cards-grid">
          <div class="info-card-pro">
            <div class="card-header">
              <h2 class="card-title">
                <svg class="title-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                Personal Information
              </h2>
            </div>
            <div class="card-content">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-icon">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm8-1a1 1 0 100 2h1a1 1 0 100-2h-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="info-content">
                    <label class="info-label">Employee ID</label>
                    <span class="info-value">{{ user.employeeId }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                  <div class="info-content">
                    <label class="info-label">Email Address</label>
                    <span class="info-value">{{ user.email }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                  </div>
                  <div class="info-content">
                    <label class="info-label">Phone Number</label>
                    <span class="info-value">{{ user.phoneNumber || 'Not provided' }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 6a2 2 0 11-4 0 2 2 0 014 0zm7.938-1.72a.75.75 0 00-1.376.64 3.501 3.501 0 010 2.16.75.75 0 101.376.64 5.001 5.001 0 000-3.44z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="info-content">
                    <label class="info-label">Department</label>
                    <span class="info-value">{{ user.department || 'Not specified' }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="info-content">
                    <label class="info-label">Date Joined</label>
                    <span class="info-value">{{ user.dateJoined | date:'mediumDate' }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="info-content">
                    <label class="info-label">Job Title</label>
                    <span class="info-value">{{ user.designation || 'Not specified' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="actions-card-pro">
            <div class="card-header">
              <h2 class="card-title">
                <svg class="title-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                </svg>
                Quick Actions
              </h2>
            </div>
            <div class="card-content">
              <div class="action-grid">
                <button class="action-card" (click)="viewAssets()">
                  <div class="action-icon">
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="action-content">
                    <h3 class="action-title">View Assets</h3>
                    <p class="action-description">See all assets assigned to this user</p>
                  </div>
                </button>
                <button class="action-card" (click)="viewHistory()">
                  <div class="action-icon">
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="action-content">
                    <h3 class="action-title">Allocation History</h3>
                    <p class="action-description">View complete asset allocation history</p>
                  </div>
                </button>
              </div>
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
    .user-detail-pro {
      padding: var(--space-4);
      max-width: 1400px;
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

    .user-profile {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .user-avatar-large {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: var(--font-bold);
      font-size: var(--text-xl);
    }

    .user-info h1 {
      font-size: var(--text-2xl);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0 0 var(--space-1) 0;
    }

    .user-title {
      color: var(--gray-600);
      font-size: var(--text-sm);
      margin: 0 0 var(--space-3) 0;
    }

    .user-badges {
      display: flex;
      gap: var(--space-2);
    }

    .status-badge, .role-badge {
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      text-transform: uppercase;
    }

    .status-active {
      background: var(--success-100);
      color: var(--success-700);
    }

    .status-inactive {
      background: var(--error-100);
      color: var(--error-700);
    }

    .role-admin {
      background: var(--warning-100);
      color: var(--warning-700);
    }

    .role-employee {
      background: var(--info-100);
      color: var(--info-700);
    }

    .role-it_support {
      background: var(--primary-100);
      color: var(--primary-700);
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
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
      text-decoration: none;
      border: none;
    }

    .btn-pro.primary {
      background: var(--primary-600);
      color: white;
    }

    .btn-pro.primary:hover {
      background: var(--primary-700);
      transform: translateY(-1px);
    }

    .btn-pro.outline {
      background: white;
      border: 1px solid var(--gray-300);
      color: var(--gray-700);
    }

    .btn-pro.outline:hover {
      background: var(--gray-50);
    }

    .btn-pro.warning {
      background: var(--warning-600);
      color: white;
    }

    .btn-pro.warning:hover {
      background: var(--warning-700);
      transform: translateY(-1px);
    }

    .content-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-6);
    }

    .info-card-pro, .actions-card-pro {
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

    .info-grid {
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

    .action-grid {
      display: grid;
      gap: var(--space-3);
    }

    .action-card {
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
      width: 100%;
    }

    .action-card:hover {
      background: var(--gray-50);
      border-color: var(--primary-600);
      transform: translateY(-1px);
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

    .action-description {
      font-size: var(--text-xs);
      color: var(--gray-600);
      margin: 0;
    }

    .error-state, .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      padding: var(--space-8);
    }

    .error-icon {
      color: var(--error-500);
      margin-bottom: var(--space-4);
    }

    .error-title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0 0 var(--space-2) 0;
    }

    .error-description {
      color: var(--gray-600);
      margin: 0 0 var(--space-6) 0;
    }

    .loading-spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid var(--gray-200);
      border-top: 2px solid var(--primary-600);
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
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .user-detail-pro {
        padding: var(--space-3);
      }
      
      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-4);
      }
      
      .user-profile {
        flex-direction: column;
        text-align: center;
        gap: var(--space-3);
      }
      
      .content-section {
        grid-template-columns: 1fr;
        gap: var(--space-4);
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
}