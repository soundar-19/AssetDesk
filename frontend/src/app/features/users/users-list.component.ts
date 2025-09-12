import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { SearchFilterComponent, FilterOption, SearchFilters } from '../../shared/components/search-filter/search-filter.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, SearchFilterComponent],
  template: `
    <div class="users-list">
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

      <app-data-table
        [data]="users"
        [columns]="columns"
        [actions]="actions"
        [pagination]="pagination"
        [sortColumn]="sortColumn"
        [sortDirection]="sortDirection"
        (pageChange)="onPageChange($event)"
        (sort)="onSort($event)">
      </app-data-table>
    </div>
  `,
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  pagination: any = null;
  searchTerm = '';
  filters: SearchFilters = {};
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  columns: TableColumn[] = [
    { key: 'employeeId', label: 'Employee ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

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

  actions: TableAction[] = [
    { label: 'Edit', icon: '✏', action: (user) => this.editUser(user.id), condition: () => this.roleService.canManageUsers() },
    { label: 'Reset Password', icon: '🔑', action: (user) => this.resetPassword(user.id, user.name), condition: () => this.roleService.isAdmin() },
    { label: 'Delete', icon: '🗑', action: (user) => this.deleteUser(user.id), condition: () => this.roleService.canManageUsers() }
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