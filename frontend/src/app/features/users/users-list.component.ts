import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models';
import { ModernListComponent, ListItem } from '../../shared/components/modern-list.component';
import { SearchFilterComponent, FilterOption, SearchFilters } from '../../shared/components/search-filter/search-filter.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, ModernListComponent, SearchFilterComponent],
  template: `
    <div class="users-list standardized-layout">
      <div class="header">
        <button *ngIf="roleService.canManageUsers()" class="btn btn-primary" (click)="createUser()">
          Add User
        </button>
      </div>

      <app-search-filter
        searchPlaceholder="Search users by name, email, or employee ID..."
        [filterOptions]="filterOptions"
        (search)="onSearch($event)"
        (filtersChange)="onFiltersChange($event)">
      </app-search-filter>

      <app-modern-list
        [items]="userItems"
        (itemClick)="onUserClick($event)">
      </app-modern-list>
    </div>
  `,
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  userItems: ListItem[] = [];
  pagination: any = null;
  searchTerm = '';
  filters: SearchFilters = {};
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
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
    public roleService: RoleService
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
      this.userService.getUsers(page, 10, this.sortColumn, this.sortDirection).subscribe({
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

    this.userService.searchUsers(searchParams, page, 10).subscribe({
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

  resetPassword(id: number, userName: string) {
    const newPassword = prompt(`Enter new password for ${userName}:`);
    if (newPassword && newPassword.length >= 6) {
      this.userService.adminResetPassword(id, newPassword).subscribe({
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
}