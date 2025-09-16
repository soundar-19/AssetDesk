import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile standardized-layout">
      <div class="header">
        <h2>My Profile</h2>
      </div>
      
      <div *ngIf="loading" class="loading">
        <div class="loading-spinner"></div>
        Loading profile...
      </div>

      <div *ngIf="!loading && user" class="profile-card">
        <div class="profile-left">
          <div class="profile-avatar" [style.background-color]="getAvatarColor(user.name)">
            {{ getInitials(user.name) }}
          </div>
          <div class="profile-details">
            <div class="profile-name">{{ user.name }}</div>
            <div class="profile-role">{{ user.role }}</div>
            <div class="profile-id">#{{ user.employeeId }}</div>
          </div>
        </div>

        <div class="profile-right">
          <div class="info-grid">
            <div class="info-row">
              <label><i class="icon-id"></i> Employee ID</label>
              <span class="info-value">{{ user.employeeId }}</span>
            </div>
            <div class="info-row">
              <label><i class="icon-email"></i> Email</label>
              <span class="info-value email-link">{{ user.email }}</span>
            </div>
            <div class="info-row">
              <label><i class="icon-department"></i> Department</label>
              <input *ngIf="isEditing" type="text" [(ngModel)]="editUser.department" class="form-input" placeholder="Enter department">
              <span *ngIf="!isEditing" class="info-value" [class.empty]="!user.department">{{ user.department || 'Not specified' }}</span>
            </div>
            <div class="info-row">
              <label><i class="icon-role"></i> Designation</label>
              <input *ngIf="isEditing" type="text" [(ngModel)]="editUser.designation" class="form-input" placeholder="Enter designation">
              <span *ngIf="!isEditing" class="info-value" [class.empty]="!user.designation">{{ user.designation || 'Not specified' }}</span>
            </div>
            <div class="info-row">
              <label><i class="icon-phone"></i> Phone Number</label>
              <input *ngIf="isEditing" type="tel" [(ngModel)]="editUser.phoneNumber" class="form-input" placeholder="Enter phone number">
              <span *ngIf="!isEditing" class="info-value" [class.empty]="!user.phoneNumber">{{ user.phoneNumber || 'Not specified' }}</span>
            </div>
            <div class="info-row">
              <label><i class="icon-status"></i> Status</label>
              <span class="status-badge" [class]="'status-' + (user.status.toLowerCase() || '')">{{ user.status }}</span>
            </div>
            <div class="info-row">
              <label><i class="icon-calendar"></i> Date Joined</label>
              <span class="info-value" [class.empty]="!user.dateJoined">{{ user.dateJoined ? (user.dateJoined | date:'mediumDate') : 'Not specified' }}</span>
            </div>
          </div>
          
          <div class="profile-actions">
          <button *ngIf="!isEditing" class="btn btn-secondary" (click)="startEdit()">
            <i class="icon-edit"></i> Edit Profile
          </button>
          <button *ngIf="isEditing" class="btn btn-primary" (click)="saveProfile()" [disabled]="saving">
            <i class="icon-save"></i> {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
          <button *ngIf="isEditing" class="btn btn-secondary" (click)="cancelEdit()">
            <i class="icon-cancel"></i> Cancel
          </button>
          <button class="btn btn-primary" (click)="changePassword()">
            <i class="icon-lock"></i> Change Password
          </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editUser: any = {};
  loading = true;
  isEditing = false;
  saving = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.userService.getUserById(currentUser.id).subscribe({
        next: (user) => {
          this.user = user;
          this.authService.updateCurrentUser(user);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.user = currentUser;
          this.loading = false;
        }
      });
    } else {
      this.user = currentUser;
      this.loading = false;
    }
  }

  changePassword() {
    this.router.navigate(['/profile/change-password']);
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  getAvatarColor(name: string): string {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString();
  }

  startEdit() {
    this.isEditing = true;
    this.editUser = { ...this.user };
  }

  cancelEdit() {
    this.isEditing = false;
    this.editUser = {};
  }

  saveProfile() {
    if (!this.user?.id) return;
    
    this.saving = true;
    this.userService.updateUser(this.user.id, this.editUser).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.authService.updateCurrentUser(updatedUser);
        this.isEditing = false;
        this.saving = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.saving = false;
      }
    });
  }
}