import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <button class="sidebar-toggle" (click)="toggleSidebar()">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
          </svg>
        </button>
        <h1 class="page-title">{{ getPageTitle() }}</h1>
      </div>
      <div class="topbar-right">
        <button class="notification-btn" (click)="openNotifications()">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
          </svg>
          <span class="notification-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
        </button>
        <div class="user-menu">
          <div class="user-avatar">
            <span>{{ getUserInitials() }}</span>
          </div>
          <div class="user-info" *ngIf="currentUser">
            <div class="user-name">{{ currentUser.name }}</div>
            <div class="user-role">{{ currentUser.role }}</div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 80px;
      background-color: white;
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-8);
      box-shadow: var(--shadow-sm);
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .sidebar-toggle {
      background: none;
      border: none;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      color: var(--gray-500);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background-color: var(--gray-100);
        color: var(--gray-700);
      }
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }

    .notification-btn {
      position: relative;
      background: none;
      border: none;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      color: var(--gray-500);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background-color: var(--gray-100);
        color: var(--gray-700);
      }
    }

    .notification-badge {
      position: absolute;
      top: 0;
      right: 0;
      background-color: var(--error-500);
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(25%, -25%);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      color: var(--gray-900);
      font-size: 0.875rem;
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--gray-500);
      text-transform: capitalize;
    }

    .logout-btn {
      background: none;
      border: none;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      color: var(--gray-500);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background-color: var(--gray-100);
        color: var(--gray-700);
      }
    }
  `]
})
export class AppHeaderComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();
  currentUser: any = null;
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    public roleService: RoleService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUnreadCount();
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount = count,
      error: () => this.unreadCount = 0
    });
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  getPageTitle(): string {
    const route = this.router.url;
    
    // Handle specific routes with custom titles
    if (route.includes('/assets/new')) return 'Add New Asset';
    if (route.includes('/assets/edit')) return 'Edit Asset';
    if (route.includes('/assets/')) return 'Asset Details';
    if (route.includes('/issues/new')) return 'Report Issue';
    if (route.includes('/issues/')) return 'Issue Details';
    if (route.includes('/users/new')) return 'Add User';
    if (route.includes('/users/edit')) return 'Edit User';
    
    // Handle main sections
    const section = route.split('/')[1] || 'dashboard';
    const titleMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'assets': 'Assets',
      'issues': 'Issues',
      'users': 'Users',
      'vendors': 'Vendors',
      'reports': 'Reports',
      'profile': 'Profile',
      'notifications': 'Notifications',
      'messages': 'Messages',
      'service-records': 'Service Records',
      'allocations': 'Allocations'
    };
    
    return titleMap[section] || section.charAt(0).toUpperCase() + section.slice(1);
  }



  getUserInitials(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}