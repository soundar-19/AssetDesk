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
        <div class="page-info">
          <button *ngIf="isOnChatPage()" class="back-btn" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"/>
            </svg>
          </button>
          <div class="breadcrumbs">
            <span class="breadcrumb-item">{{ getBreadcrumbs()[0] }}</span>
            <span *ngIf="getBreadcrumbs().length > 1" class="breadcrumb-separator">&gt;</span>
            <span *ngIf="getBreadcrumbs().length > 1" class="breadcrumb-item current">{{ getBreadcrumbs()[1] }}</span>
          </div>
        </div>
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
      height: 64px;
      background-color: white;
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-6);
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
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      height: 40px;

      &:hover {
        background-color: var(--gray-100);
        color: var(--gray-700);
      }
    }

    .page-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: var(--gray-100);
      border-radius: var(--radius-full);
      color: var(--gray-600);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .back-btn:hover {
      background: var(--gray-200);
      color: var(--gray-900);
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .breadcrumb-item {
      font-size: var(--text-lg);
      color: var(--gray-600);
      font-weight: 600;
    }

    .breadcrumb-item.current {
      color: var(--gray-900);
      font-weight: 700;
    }

    .breadcrumb-separator {
      color: var(--gray-400);
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .chat-meta {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-top: var(--space-1);
    }

    .asset-tag {
      font-size: 0.875rem;
      color: var(--gray-600);
      font-family: monospace;
      background: var(--gray-100);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .status-badge, .priority-badge {
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-open { background: #dbeafe; color: #1e40af; }
    .status-in_progress { background: #fef3c7; color: #92400e; }
    .status-resolved { background: #dcfce7; color: #166534; }
    .status-closed { background: #f3f4f6; color: #374151; }

    .priority-low { background: #dcfce7; color: #166534; }
    .priority-medium { background: #fef3c7; color: #92400e; }
    .priority-high { background: #fee2e2; color: #991b1b; }

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
    
    @media (max-width: 1024px) {
      .topbar {
        padding: 0 var(--space-4);
      }
      
      .page-title {
        font-size: 1.25rem;
      }
    }
    
    @media (max-width: 768px) {
      .topbar {
        height: 60px;
        padding: 0 var(--space-3);
      }
      
      .topbar-left {
        gap: var(--space-2);
      }
      
      .page-title {
        font-size: 1.125rem;
      }
      
      .user-info {
        display: none;
      }
      
      .chat-meta {
        flex-wrap: wrap;
        gap: var(--space-2);
      }
    }
    
    @media (max-width: 480px) {
      .topbar {
        height: 56px;
        padding: 0 var(--space-2);
      }
      
      .page-title {
        font-size: 1rem;
      }
      
      .topbar-right {
        gap: var(--space-2);
      }
      
      .user-avatar {
        width: 32px;
        height: 32px;
        font-size: 0.75rem;
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
    if (route.includes('/issues/') && route.includes('/chat')) {
      return 'Issue Chat';
    }
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

  isOnChatPage(): boolean {
    return this.router.url.includes('/issues/') && this.router.url.includes('/chat');
  }

  goBack() {
    this.router.navigate(['/issues']);
  }

  getBreadcrumbs(): string[] {
    const route = this.router.url;
    const segments = route.split('/').filter(s => s);
    
    if (segments.length === 0) return ['Dashboard'];
    if (segments[0] === 'dashboard') return ['Dashboard'];
    if (segments[0] === 'assets' && segments[1] === 'new') return ['Assets', 'New Asset'];
    if (segments[0] === 'assets' && segments[2] === 'edit') return ['Assets', 'Edit Asset'];
    if (segments[0] === 'assets' && segments[1]) return ['Assets', 'Asset Details'];
    if (segments[0] === 'issues' && segments[1] === 'new') return ['Issues', 'New Issue'];
    if (segments[0] === 'users' && segments[1] === 'new') return ['Users', 'New User'];
    
    const sectionMap: { [key: string]: string } = {
      'assets': 'Assets',
      'issues': 'Issues', 
      'users': 'Users',
      'vendors': 'Vendors',
      'reports': 'Reports',
      'profile': 'Profile',
      'service-records': 'Service Records'
    };
    
    return [sectionMap[segments[0]] || segments[0]];
  }
}