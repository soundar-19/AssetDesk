import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models';
import { ListItem } from '../../shared/components/modern-list.component';
import { SearchFilterComponent, FilterOption, SearchFilters } from '../../shared/components/search-filter/search-filter.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { RoleService } from '../../core/services/role.service';
import { InputModalService } from '../../shared/components/input-modal/input-modal.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, SearchFilterComponent],
  template: `
    <div class="users-list-pro">
      <div class="page-header-pro">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">User Management</h1>
            <p class="page-subtitle">Manage system users, roles, and permissions</p>
          </div>
          <div class="header-actions">
            <button *ngIf="roleService.canManageUsers()" class="btn-pro primary" (click)="createUser()">
              <svg class="btn-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Add User
            </button>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="search-section">
          <app-search-filter
            searchPlaceholder="Search users by name, email, or employee ID..."
            [filterOptions]="filterOptions"
            (search)="onSearch($event)"
            (filtersChange)="onFiltersChange($event)">
          </app-search-filter>
        </div>

        <div class="users-grid">
          <div *ngFor="let user of users" class="user-card-pro" (click)="viewUser(user.id)">
            <div class="card-header">
              <div class="user-avatar">
                <span class="avatar-text">{{ getInitials(user.name) }}</span>
              </div>
              <div class="user-status">
                <span class="status-badge" [class]="'status-' + user.status.toLowerCase()">{{ user.status }}</span>
              </div>
            </div>
            
            <div class="card-content">
              <h3 class="user-name">{{ user.name }}</h3>
              <p class="user-email">{{ user.email }}</p>
              <div class="user-meta">
                <span class="meta-item">
                  <svg class="meta-icon" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  {{ user.role }}
                </span>
                <span class="meta-item">
                  <svg class="meta-icon" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm8-1a1 1 0 100 2h1a1 1 0 100-2h-1z" clip-rule="evenodd" />
                  </svg>
                  {{ user.employeeId }}
                </span>
              </div>
              <div class="department-tag">{{ user.department }}</div>
            </div>
            
            <div class="card-actions" (click)="$event.stopPropagation()">
              <button *ngIf="roleService.canManageUsers()" class="action-btn-mini primary" (click)="editUser(user.id)" title="Edit User">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button *ngIf="roleService.isAdmin()" class="action-btn-mini warning" (click)="resetPassword(user.id, user.name)" title="Reset Password">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button *ngIf="roleService.canManageUsers()" class="action-btn-mini error" (click)="deleteUser(user.id)" title="Delete User">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div *ngIf="users.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 12a1 1 0 102 0V8a1 1 0 10-2 0v4zm1-7a1 1 0 100 2 1 1 0 000-2z" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="empty-title">No users found</h3>
          <p class="empty-description">Try adjusting your search criteria or add a new user.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-list-pro {
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
      color: white;
      background: var(--primary-600);
      border: none;
      cursor: pointer;
      transition: var(--transition-fast);
      text-decoration: none;
    }

    .header-actions .btn-pro:hover {
      background: var(--primary-700);
      transform: translateY(-1px);
    }

    .content-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-4);
    }

    .user-card-pro {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      cursor: pointer;
      transition: var(--transition-fast);
      position: relative;
    }

    .user-card-pro::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-600);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }

    .user-card-pro:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-600);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
    }

    .user-avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: var(--font-semibold);
      font-size: var(--text-lg);
    }

    .user-status .status-badge {
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

    .card-content {
      margin-bottom: var(--space-4);
    }

    .user-name {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0 0 var(--space-1) 0;
    }

    .user-email {
      color: var(--gray-600);
      font-size: var(--text-sm);
      margin: 0 0 var(--space-3) 0;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-xs);
      color: var(--gray-600);
    }

    .meta-icon {
      color: var(--gray-400);
    }

    .department-tag {
      display: inline-block;
      background: var(--gray-100);
      color: var(--gray-700);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
    }

    .card-actions {
      display: flex;
      gap: var(--space-2);
      justify-content: flex-end;
    }

    .action-btn-mini {
      width: 2rem;
      height: 2rem;
      border: none;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .action-btn-mini.primary {
      background: var(--primary-600);
      color: white;
    }

    .action-btn-mini.primary:hover {
      background: var(--primary-700);
    }

    .action-btn-mini.warning {
      background: var(--warning-600);
      color: white;
    }

    .action-btn-mini.warning:hover {
      background: var(--warning-700);
    }

    .action-btn-mini.error {
      background: var(--error-600);
      color: white;
    }

    .action-btn-mini.error:hover {
      background: var(--error-700);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-16);
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .empty-icon {
      color: var(--gray-400);
      margin-bottom: var(--space-4);
    }

    .empty-title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0 0 var(--space-2) 0;
    }

    .empty-description {
      color: var(--gray-600);
      font-size: var(--text-sm);
      margin: 0;
    }

    @media (max-width: 768px) {
      .users-list-pro {
        padding: var(--space-3);
      }
      
      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-3);
      }
      
      .users-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  userItems: ListItem[] = [];
  pagination: any = null;
  searchTerm = '';
  filters: SearchFilters = {};
  sortColumn = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  filterOptions: FilterOption[] = [
    {
      key: 'department',
      label: 'Department',
      type: 'text',
      placeholder: 'Filter by department'
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'ADMIN', label: 'Admin' },
        { value: 'MANAGER', label: 'Manager' },
        { value: 'EMPLOYEE', label: 'Employee' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' }
      ]
    }
  ];

  constructor(
    private userService: UserService,
    private router: Router,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService,
    public roleService: RoleService,
    private inputModalService: InputModalService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(page: number = 0) {
    const hasSearch = this.searchTerm && this.searchTerm.trim() !== '';
    const hasFilters = Object.values(this.filters).some(value => value !== null && value !== undefined && value !== '');
    
    if (hasSearch || hasFilters) {
      this.searchUsers(page);
    } else {
      this.userService.getUsers(page, 50, this.sortColumn, this.sortDirection).subscribe({
        next: (response) => {
          this.users = response?.content || [];
          this.userItems = this.transformToListItems(this.users);
          this.pagination = {
            page: response?.number || 0,
            totalPages: response?.totalPages || 0,
            totalElements: response?.totalElements || 0
          };
        },
        error: (error) => {
          console.error('Failed to load users:', error);
          this.users = [];
          this.pagination = { page: 0, totalPages: 0, totalElements: 0 };
          this.toastService.error('Failed to load users');
        }
      });
    }
  }

  searchUsers(page: number = 0) {
    const searchParams: any = {
      sortBy: this.sortColumn,
      sortDir: this.sortDirection
    };
    
    // Add search term to relevant fields if provided
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      searchParams.name = this.searchTerm.trim();
      searchParams.email = this.searchTerm.trim();
      searchParams.employeeId = this.searchTerm.trim();
    }
    
    // Add individual filters
    Object.keys(this.filters).forEach(key => {
      const value = this.filters[key];
      if (value !== null && value !== undefined && value !== '') {
        searchParams[key] = value;
      }
    });

    this.userService.searchUsers(searchParams, page, 50).subscribe({
      next: (response) => {
        this.users = response?.content || [];
        this.userItems = this.transformToListItems(this.users);
        this.pagination = {
          page: response?.number || 0,
          totalPages: response?.totalPages || 0,
          totalElements: response?.totalElements || 0
        };
      },
      error: (error) => {
        console.error('Failed to search users:', error);
        this.users = [];
        this.pagination = { page: 0, totalPages: 0, totalElements: 0 };
        this.toastService.error('Failed to search users');
      }
    });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.loadUsers(0);
  }

  onFiltersChange(filters: SearchFilters) {
    this.filters = filters;
    this.loadUsers(0);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.loadUsers(0);
  }

  onPageChange(page: number) {
    this.loadUsers(page);
  }

  createUser() {
    this.router.navigate(['/users/new']);
  }

  editUser(id: number) {
    this.router.navigate(['/users', id, 'edit']);
  }

  async resetPassword(id: number, userName: string) {
    const newPassword = await this.inputModalService.promptPassword(
      'Reset Password',
      `Enter new password for ${userName}:`,
      6
    );
    
    if (newPassword) {
      this.userService.adminResetPassword(id, newPassword).subscribe({
        next: () => {
          this.toastService.success('Password reset successfully');
        },
        error: () => {
          this.toastService.error('Failed to reset password');
        }
      });
    }
  }

  viewUser(user: any) {
    this.router.navigate(['/users', user.id || user]);
  }

  viewUserAssets(id: number) {
    this.router.navigate(['/users', id, 'assets']);
  }

  viewUserHistory(id: number) {
    this.router.navigate(['/users', id, 'allocations']);
  }

  transformToListItems(users: User[]): ListItem[] {
    return users.map(user => ({
      id: user.id,
      title: user.name,
      subtitle: `${user.email} • ${user.department}`,
      status: user.status,
      badge: user.role,
      metadata: [
        { label: 'Employee ID', value: user.employeeId },
        { label: 'Role', value: user.role },
        { label: 'Department', value: user.department }
      ],
      actions: [
        { label: 'Edit', icon: '✏', action: () => this.editUser(user.id), primary: this.roleService.canManageUsers() },
        { label: 'Reset', icon: '🔑', action: () => this.resetPassword(user.id, user.name), primary: false },
        { label: 'Delete', icon: '🗑', action: () => this.deleteUser(user.id), primary: false }
      ].filter(action => {
        if (action.label === 'Edit' || action.label === 'Delete') return this.roleService.canManageUsers();
        if (action.label === 'Reset') return this.roleService.isAdmin();
        return true;
      })
    }));
  }

  onUserClick(item: ListItem) {
    this.router.navigate(['/users', item.id]);
  }

  deleteUser(id: number) {
    this.confirmDialog.confirmDelete('user').subscribe(confirmed => {
      if (confirmed) {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            this.toastService.success('User deleted successfully');
            this.loadUsers();
          },
          error: () => {
            this.toastService.error('Failed to delete user');
          }
        });
      }
    });
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