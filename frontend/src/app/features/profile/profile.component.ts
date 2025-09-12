import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile">
      <div class="header">
        <h2>My Profile</h2>
      </div>
      
      <div *ngIf="loading" class="loading">
        <div class="loading-spinner"></div>
        Loading profile...
      </div>

      <div *ngIf="!loading && user" class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            {{ getInitials(user.name) }}
          </div>
          <div class="profile-name">{{ user.name }}</div>
          <div class="profile-role">{{ user.role }}</div>
        </div>

        <div class="profile-info">
          <div class="info-grid">
            <div class="info-row">
              <label>Employee ID</label>
              <span>{{ user.employeeId }}</span>
            </div>
            <div class="info-row">
              <label>Email</label>
              <span>{{ user.email }}</span>
            </div>
            <div class="info-row">
              <label>Department</label>
              <span [class.empty]="!user.department">{{ user.department || 'Not specified' }}</span>
            </div>
            <div class="info-row">
              <label>Designation</label>
              <span [class.empty]="!user.designation">{{ user.designation || 'Not specified' }}</span>
            </div>
            <div class="info-row">
              <label>Phone Number</label>
              <span [class.empty]="!user.phoneNumber">{{ user.phoneNumber || 'Not specified' }}</span>
            </div>
            <div class="info-row">
              <label>Status</label>
              <span class="status-badge" [class]="'status-' + (user.status.toLowerCase() || '')">{{ user.status }}</span>
            </div>
            <div class="info-row">
              <label>Date Joined</label>
              <span [class.empty]="!user.dateJoined">{{ user.dateJoined ? (user.dateJoined | date:'mediumDate') : 'Not specified' }}</span>
            </div>
          </div>
        </div>
        
        <div class="profile-actions">
          <button class="btn btn-primary" (click)="changePassword()">Change Password</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;

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
}