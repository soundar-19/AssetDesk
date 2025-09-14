import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-user-selector-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-overlay" (click)="cancel()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>{{ singleUser ? 'Select User for Asset Allocation' : 'Select Users for License Allocation' }}</h2>
          <p>{{ singleUser ? 'Assign ' + licenseName + ' to one user' : licenseCount + ' seats available for ' + licenseName }}</p>
        </div>

        <div class="search-section">
          <input type="text" 
                 class="search-input" 
                 placeholder="Search users..." 
                 [(ngModel)]="searchTerm" 
                 (input)="filterUsers()">
        </div>

        <div class="users-list">
          <div *ngFor="let user of filteredUsers" 
               class="user-item" 
               [class.selected]="selectedUsers.has(user.id)"
               (click)="toggleUser(user)">
            <div class="user-checkbox">
              <input type="checkbox" 
                     [checked]="selectedUsers.has(user.id)"
                     (click)="$event.stopPropagation()">
            </div>
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-email">{{ user.email }}</div>
              <div class="user-department" *ngIf="user.department">{{ user.department }}</div>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <div class="selection-info">
            {{ selectedUsers.size }} {{ singleUser ? 'user' : 'users' }} selected {{ singleUser ? '' : '(' + licenseCount + ' seats available)' }}
          </div>
          <div class="dialog-actions">
            <button class="btn btn-secondary" (click)="cancel()">Cancel</button>
            <button class="btn btn-primary" 
                    [disabled]="selectedUsers.size === 0 || (singleUser && selectedUsers.size > 1) || (!singleUser && selectedUsers.size > licenseCount)"
                    (click)="confirm()">
              {{ singleUser ? 'Allocate to User' : 'Allocate to ' + selectedUsers.size + ' Users' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog-content { background: white; border-radius: 0.5rem; width: 500px; max-height: 80vh; display: flex; flex-direction: column; }
    .dialog-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .dialog-header h2 { margin: 0 0 0.5rem 0; font-size: 1.25rem; font-weight: 600; }
    .dialog-header p { margin: 0; color: #6b7280; }
    
    .search-section { padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .search-input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
    
    .users-list { max-height: 400px; overflow-y: auto; flex: 1; }
    .user-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; cursor: pointer; border-bottom: 1px solid #f3f4f6; }
    .user-item:hover { background: #f9fafb; }
    .user-item.selected { background: #eff6ff; border-color: #3b82f6; }
    
    .user-info { flex: 1; }
    .user-name { font-weight: 500; color: #111827; }
    .user-email { font-size: 0.875rem; color: #6b7280; }
    .user-department { font-size: 0.75rem; color: #3b82f6; font-weight: 500; }
    
    .dialog-footer { padding: 1.5rem; border-top: 1px solid #e5e7eb; }
    .selection-info { margin-bottom: 1rem; font-size: 0.875rem; color: #6b7280; }
    .dialog-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
    
    .btn { padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; cursor: pointer; border: none; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }
  `]
})
export class UserSelectorDialogComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers = new Set<number>();
  searchTerm = '';
  @Input() licenseCount = 0;
  @Input() licenseName = '';
  @Input() singleUser = false;
  @Output() onConfirm = new EventEmitter<User[]>();
  @Output() onCancel = new EventEmitter<void>();

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response?.content || [];
        this.filteredUsers = [...this.users];
      },
      error: () => {
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  filterUsers() {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term) ||
      user.department?.toLowerCase().includes(term)
    );
  }

  toggleUser(user: User) {
    if (this.selectedUsers.has(user.id)) {
      this.selectedUsers.delete(user.id);
    } else if (this.singleUser) {
      this.selectedUsers.clear();
      this.selectedUsers.add(user.id);
    } else if (this.selectedUsers.size < this.licenseCount) {
      this.selectedUsers.add(user.id);
    }
  }

  confirm() {
    const selectedUsersList = this.users.filter(user => this.selectedUsers.has(user.id));
    this.onConfirm.emit(selectedUsersList);
  }

  cancel() {
    this.onCancel.emit();
  }
}