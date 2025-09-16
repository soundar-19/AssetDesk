import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        <div class="logo" (click)="toggleSidebar()">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--primary-600)"/>
            <path d="M10 8h12a2 2 0 012 2v4a2 2 0 01-2 2H10a2 2 0 01-2-2v-4a2 2 0 012-2z" fill="white"/>
            <path d="M8 18h16v2H8v-2zm0 4h12v2H8v-2z" fill="white"/>
            <circle cx="20" cy="20" r="3" fill="white"/>
            <path d="M19 20l1 1 2-2" stroke="var(--primary-600)" stroke-width="1.5" fill="none"/>
          </svg>
          <span *ngIf="!collapsed" class="logo-text">AssetDesk</span>
        </div>
        <button class="close-btn" (click)="closeSidebar()" *ngIf="!collapsed">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title" *ngIf="!collapsed">Overview</div>
          <a routerLink="/dashboard" class="nav-item" routerLinkActive="active">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            <span *ngIf="!collapsed">Dashboard</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-title" *ngIf="!collapsed">Assets</div>
          <a routerLink="/assets" class="nav-item" routerLinkActive="active">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2H3zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
            </svg>
            <span *ngIf="!collapsed">Assets</span>
          </a>


          <a routerLink="/requests" class="nav-item" routerLinkActive="active">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"/>
            </svg>
            <span *ngIf="!collapsed">Asset Requests</span>
          </a>
          
          <a routerLink="/return-requests" class="nav-item" routerLinkActive="active" *ngIf="roleService.isEmployee()">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"/>
            </svg>
            <span *ngIf="!collapsed">Return Requests</span>
          </a>
          
          <a routerLink="/admin/return-requests" class="nav-item" routerLinkActive="active" *ngIf="roleService.canManageAssets()">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"/>
            </svg>
            <span *ngIf="!collapsed">Assets Return</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-title" *ngIf="!collapsed">Support</div>
          <a routerLink="/issues" class="nav-item" routerLinkActive="active">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
            </svg>
            <span *ngIf="!collapsed">{{ roleService.isEmployee() ? 'My Issues' : 'Issues' }}</span>
          </a>
        </div>

        <div class="nav-section" *ngIf="roleService.canManageAssets()">
          <div class="nav-section-title" *ngIf="!collapsed">Management</div>
          <a routerLink="/vendors" class="nav-item" routerLinkActive="active">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z"/>
            </svg>
            <span *ngIf="!collapsed">Vendors</span>
          </a>
          <a routerLink="/service-records" class="nav-item" routerLinkActive="active">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
            </svg>
            <span *ngIf="!collapsed">Service Records</span>
          </a>
        </div>
        
        <div class="nav-section" *ngIf="roleService.canManageUsers()">
          <div class="nav-section-title" *ngIf="!collapsed">Admin Tools</div>
          <a routerLink="/warranty" class="nav-item" routerLinkActive="active">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11.166 4.12C9.758 4.569 8.589 5.498 8 6.739 7.411 5.498 6.242 4.57 4.834 4.12A9.957 9.957 0 0110 3c.34 0 .677.02 1.166.12z"/>
            </svg>
            <span *ngIf="!collapsed">Warranty Management</span>
          </a>
        </div>

        <div class="nav-section" *ngIf="roleService.canManageUsers()">
          <div class="nav-section-title" *ngIf="!collapsed">Administration</div>
          <a routerLink="/users" class="nav-item" routerLinkActive="active">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            <span *ngIf="!collapsed">Users</span>
          </a>
        </div>
        
        <div class="nav-section" *ngIf="roleService.canViewReports()">
          <div class="nav-section-title" *ngIf="!collapsed">Reports</div>
          <a routerLink="/reports" class="nav-item" routerLinkActive="active">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
            <span *ngIf="!collapsed">Reports</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-title" *ngIf="!collapsed">Account</div>
          <a routerLink="/profile" class="nav-item" routerLinkActive="active">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
            <span *ngIf="!collapsed">Profile</span>
          </a>
        </div>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      background-color: white;
      border-right: 1px solid var(--gray-200);
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      height: 100vh;
      overflow: hidden;
      position: relative;
      z-index: 1000;

      &.collapsed {
        width: 80px;
      }
    }
    
    @media (max-width: 1024px) {
      .sidebar {
        width: 240px;
        
        &.collapsed {
          width: 80px;
        }
      }
    }
    
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        width: 260px;
        transform: translateX(-100%);
        box-shadow: var(--shadow-lg);
        
        &:not(.collapsed) {
          transform: translateX(0);
        }
        
        &.collapsed {
          transform: translateX(-100%);
          width: 260px;
        }
      }
    }

    .sidebar-header {
      padding: var(--space-5);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    
    .sidebar.collapsed .sidebar-header {
      justify-content: center;
      padding: var(--space-3);
    }
    
    .close-btn {
      background: none;
      border: none;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      color: var(--gray-500);
      cursor: pointer;
      transition: all 0.3s ease, opacity 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 1;
    }
    
    .sidebar.collapsed .close-btn {
      opacity: 0;
      pointer-events: none;
    }
    
    .close-btn:hover {
      background-color: var(--gray-100);
      color: var(--gray-700);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-900);
      opacity: 1;
      transition: opacity var(--transition-fast);
      white-space: nowrap;
    }
    
    .sidebar.collapsed .logo-text {
      opacity: 0;
      width: 0;
    }

    .sidebar-nav {
      flex: 1;
      padding: var(--space-4);
      overflow-y: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      
      &::-webkit-scrollbar {
        display: none;
      }
    }
    
    .sidebar.collapsed .sidebar-nav {
      padding: var(--space-2);
    }

    .nav-section {
      margin-bottom: var(--space-6);
    }

    .nav-section-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--space-3);
      padding: 0 var(--space-3);
      opacity: 1;
      transition: opacity var(--transition-fast);
      white-space: nowrap;
      overflow: hidden;
    }
    
    .sidebar.collapsed .nav-section-title {
      opacity: 0;
      height: 0;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      color: var(--gray-600);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease 0.1s;
      margin-bottom: var(--space-1);
      overflow: hidden;
      white-space: nowrap;

      &:hover {
        background-color: var(--gray-100);
        color: var(--gray-900);
        transform: translateX(4px);
      }

      &.active {
        background-color: var(--primary-50);
        color: var(--primary-700);
        border: 1px solid var(--primary-200);
        transform: translateX(4px);
      }
      
      span {
        opacity: 1;
        transition: opacity 0.2s ease;
      }
    }
    
    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: var(--space-3);
      margin: var(--space-1) auto;
      transform: none !important;
      transition-delay: 0s;
      
      &:hover {
        transform: none !important;
      }
      
      &.active {
        transform: none !important;
      }
      
      span {
        opacity: 0;
        width: 0;
      }
    }

    .nav-icon {
      flex-shrink: 0;
    }
  `]
})
export class AppSidenavComponent implements OnInit {
  @Input() collapsed = false;
  currentRoute = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    public roleService: RoleService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }
  
  closeSidebar() {
    // This will be handled by parent component
    const event = new CustomEvent('closeSidebar');
    window.dispatchEvent(event);
  }
  
  toggleSidebar() {
    const event = new CustomEvent('toggleSidebar');
    window.dispatchEvent(event);
  }
}