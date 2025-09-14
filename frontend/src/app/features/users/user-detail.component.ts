import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models';
import { RoleService } from '../../core/services/role.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-detail" *ngIf="user">
      <div class="header">
        <h1>{{ user.name }}</h1>
        <div class="actions">
          <button class="btn btn-outline" (click)="goBack()">Back</button>
          <button *ngIf="roleService.canManageUsers()" class="btn btn-primary" (click)="editUser()">Edit</button>
          <button *ngIf="roleService.isAdmin()" class="btn btn-warning" (click)="resetPassword()">Reset Password</button>
        </div>
      </div>

      <div class="content">
        <div class="info-card">
          <h2>Basic Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Employee ID</label>
              <span>{{ user.employeeId }}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span>{{ user.email }}</span>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <span>{{ user.phoneNumber || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Role</label>
              <span class="badge" [class]="'badge-' + user.role.toLowerCase()">{{ user.role }}</span>
            </div>
            <div class="info-item">
              <label>Department</label>
              <span>{{ user.department }}</span>
            </div>
            <div class="info-item">
              <label>Designation</label>
              <span>{{ user.designation || 'Not specified' }}</span>
            </div>
            <div class="info-item">
              <label>Status</label>
              <span class="badge" [class]="'badge-' + user.status.toLowerCase()">{{ user.status }}</span>
            </div>
            <div class="info-item">
              <label>Date Joined</label>
              <span>{{ user.dateJoined | date }}</span>
            </div>
          </div>
        </div>

        <div class="actions-card">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <button class="btn btn-outline" (click)="viewAssets()">
              <span>📦</span>
              View Assets
            </button>
            <button class="btn btn-outline" (click)="viewHistory()">
              <span>📋</span>
              Allocation History
            </button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!user && !loading" class="error">
      User not found
    </div>

    <div *ngIf="loading" class="loading">
      Loading user details...
    </div>


  `,
  styles: [`
    .user-detail {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .header h1 {
      margin: 0;
      color: #111827;
      font-size: 2rem;
      font-weight: 700;
    }

    .actions {
      display: flex;
      gap: 1rem;
    }

    .content {
      display: grid;
      gap: 2rem;
    }

    .info-card, .actions-card {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .info-card h2, .actions-card h2 {
      margin: 0 0 1rem 0;
      color: #111827;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
    }

    .info-item span {
      color: #111827;
      font-weight: 500;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      width: fit-content;
    }

    .badge-admin {
      background: #fee2e2;
      color: #b91c1c;
    }

    .badge-it_support {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .badge-manager {
      background: #ede9fe;
      color: #7c3aed;
    }

    .badge-employee {
      background: #dcfce7;
      color: #15803d;
    }

    .badge-active {
      background: #dcfce7;
      color: #15803d;
    }

    .badge-inactive {
      background: #f3f4f6;
      color: #374151;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .action-buttons .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
      text-decoration: none;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-outline {
      background: white;
      border-color: #d1d5db;
      color: #374151;
    }

    .btn-outline:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .btn-warning {
      background: #d97706;
      color: white;
    }

    .btn-warning:hover {
      background: #b45309;
    }

    .loading, .error {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .user-detail {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .actions {
        justify-content: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
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
    private toastService: ToastService
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

  resetPassword() {
    if (this.user) {
      const newPassword = prompt(`Enter new password for ${this.user.name}:`);
      if (newPassword && newPassword.length >= 6) {
        this.userService.adminResetPassword(this.user.id, newPassword).subscribe({
          next: () => {
            this.toastService.success('Password reset successfully');
          },
          error: () => {
            this.toastService.error('Failed to reset password');
          }
        });
      } else if (newPassword !== null) {
        this.toastService.error('Password must be at least 6 characters long');
      }
    }
  }
}