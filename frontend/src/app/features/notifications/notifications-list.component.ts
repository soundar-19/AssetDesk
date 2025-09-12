import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { Notification, PaginationInfo, NotificationType } from '../../core/models';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <h1 class="page-title">Notifications</h1>
          <p class="page-subtitle">Stay updated with your latest activities</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="markAllAsRead()" [disabled]="!hasUnreadNotifications()">
            <span class="btn-icon">✓</span>
            Mark All Read
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            [class.active]="!showUnreadOnly" 
            (click)="setFilter(false)">
            All ({{ totalNotifications }})
          </button>
          <button 
            class="filter-tab" 
            [class.active]="showUnreadOnly" 
            (click)="setFilter(true)">
            Unread ({{ unreadCount }})
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list" *ngIf="notifications.length > 0; else emptyState">
        <div 
          class="notification-card" 
          *ngFor="let notification of notifications; trackBy: trackByNotification"
          [class.unread]="!notification.isRead"
          (click)="viewNotification(notification)">
          
          <div class="notification-icon">
            <span class="icon" [class]="getNotificationIconClass(notification.type)">{{ getNotificationIcon(notification.type) }}</span>
          </div>
          
          <div class="notification-content">
            <div class="notification-header">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <div class="notification-meta">
                <span class="notification-type" [class]="getTypeClass(notification.type)">{{ getTypeLabel(notification.type) }}</span>
                <span class="notification-time">{{ getRelativeTime(notification.createdAt) }}</span>
              </div>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
          </div>
          
          <div class="notification-actions">
            <button 
              class="action-btn mark-read" 
              *ngIf="!notification.isRead"
              (click)="markAsRead(notification.id, $event)"
              title="Mark as read">
              ✓
            </button>
            <button 
              class="action-btn delete" 
              (click)="deleteNotification(notification.id, $event)"
              title="Delete notification">
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🔔</div>
          <h3>No notifications</h3>
          <p>{{ showUnreadOnly ? 'All caught up! No unread notifications.' : 'You have no notifications at this time.' }}</p>
        </div>
      </ng-template>

      <!-- Pagination -->
      <div class="pagination-section" *ngIf="pagination && pagination.totalPages > 1">
        <button 
          class="pagination-btn" 
          [disabled]="pagination.page === 0" 
          (click)="onPageChange(pagination.page - 1)">
          ← Previous
        </button>
        <span class="pagination-info">
          Page {{ pagination.page + 1 }} of {{ pagination.totalPages }}
        </span>
        <button 
          class="pagination-btn" 
          [disabled]="pagination.page >= pagination.totalPages - 1" 
          (click)="onPageChange(pagination.page + 1)">
          Next →
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: var(--container-xl);
      margin: 0 auto;
      padding: 0 var(--space-4);
    }

    @media (min-width: 768px) {
      .notifications-container {
        padding: 0 var(--space-6);
      }
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .header-content .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .header-content .page-subtitle {
      color: #6b7280;
      margin: 0;
      font-size: 1rem;
    }

    .header-actions .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: 2px solid #e5e7eb;
      background: white;
      color: #374151;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .header-actions .btn:hover:not(:disabled) {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .header-actions .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .filter-section {
      margin-bottom: 1.5rem;
    }

    .filter-tabs {
      display: flex;
      background: white;
      border-radius: 8px;
      padding: 0.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filter-tab {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      color: #6b7280;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-tab.active {
      background: #3b82f6;
      color: white;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.2s;
      border-left: 4px solid transparent;
    }

    .notification-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    .notification-card.unread {
      border-left-color: #3b82f6;
      background: #f8faff;
    }

    .notification-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .notification-icon .icon.info { background: #dbeafe; color: #3b82f6; }
    .notification-icon .icon.success { background: #dcfce7; color: #16a34a; }
    .notification-icon .icon.warning { background: #fef3c7; color: #d97706; }
    .notification-icon .icon.error { background: #fee2e2; color: #dc2626; }
    .notification-icon .icon.issue { background: #f3e8ff; color: #7c3aed; }
    .notification-icon .icon.message { background: #ecfdf5; color: #059669; }
    .notification-icon .icon.asset { background: #fef7ff; color: #c026d3; }
    .notification-icon .icon.maintenance { background: #fff7ed; color: #ea580c; }
    .notification-icon .icon.system { background: #f1f5f9; color: #475569; }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
      gap: 1rem;
    }

    .notification-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
      line-height: 1.4;
    }

    .notification-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    .notification-type {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .notification-type.info { background: #dbeafe; color: #1e40af; }
    .notification-type.success { background: #dcfce7; color: #166534; }
    .notification-type.warning { background: #fef3c7; color: #92400e; }
    .notification-type.error { background: #fee2e2; color: #991b1b; }
    .notification-type.issue { background: #f3e8ff; color: #6b21a8; }
    .notification-type.message { background: #ecfdf5; color: #065f46; }
    .notification-type.asset { background: #fef7ff; color: #a21caf; }
    .notification-type.maintenance { background: #fff7ed; color: #c2410c; }
    .notification-type.system { background: #f1f5f9; color: #334155; }

    .notification-time {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .notification-message {
      color: #4b5563;
      line-height: 1.5;
      margin: 0;
    }

    .notification-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .notification-card:hover .notification-actions {
      opacity: 1;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .action-btn.mark-read {
      background: #dcfce7;
      color: #16a34a;
    }

    .action-btn.mark-read:hover {
      background: #bbf7d0;
    }

    .action-btn.delete {
      background: #fee2e2;
      color: #dc2626;
    }

    .action-btn.delete:hover {
      background: #fecaca;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: #6b7280;
      margin: 0;
    }

    .pagination-section {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .pagination-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e7eb;
      background: white;
      color: #374151;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pagination-btn:hover:not(:disabled) {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-info {
      color: #6b7280;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .notifications-container {
        padding: 1rem 0.5rem;
      }

      .header-section {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .notification-card {
        padding: 1rem;
      }

      .notification-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .notification-meta {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
      }

      .notification-actions {
        opacity: 1;
        flex-direction: row;
      }
    }
  `]
})
export class NotificationsListComponent implements OnInit {
  notifications: Notification[] = [];
  pagination: PaginationInfo | null = null;
  showUnreadOnly = false;
  totalNotifications = 0;
  unreadCount = 0;

  constructor(
    private notificationService: NotificationService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications(page: number = 0) {
    const request = this.showUnreadOnly 
      ? this.notificationService.getUnreadNotifications(page, 10)
      : this.notificationService.getNotifications(page, 10);

    request.subscribe({
      next: (response) => {
        this.notifications = response.content;
        this.pagination = {
          page: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        };
        this.updateCounts();
      },
      error: (error) => {
        this.toastService.error('Failed to load notifications');
        console.error('Error loading notifications:', error);
      }
    });
  }

  updateCounts() {
    this.totalNotifications = this.pagination?.totalElements || 0;
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  onPageChange(page: number) {
    this.loadNotifications(page);
  }

  setFilter(unreadOnly: boolean) {
    this.showUnreadOnly = unreadOnly;
    this.loadNotifications();
  }

  markAsRead(id: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (error) => {
        this.toastService.error('Failed to mark notification as read');
        console.error('Error marking notification as read:', error);
      }
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.toastService.success('All notifications marked as read');
        this.loadNotifications();
      },
      error: (error) => {
        this.toastService.error('Failed to mark all notifications as read');
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  viewNotification(notification: Notification) {
    // Mark as read first
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        error: (error) => {
          this.toastService.error('Failed to mark notification as read');
          console.error('Error marking notification as read:', error);
        }
      });
    }
    
    // Redirect based on notification type
    if (notification.relatedIssueId) {
      this.router.navigate(['/issues', notification.relatedIssueId]);
    } else if (notification.relatedAssetId) {
      this.router.navigate(['/assets', notification.relatedAssetId]);
    }
  }

  deleteNotification(id: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.toastService.success('Notification deleted');
        this.loadNotifications();
      },
      error: (error) => {
        this.toastService.error('Failed to delete notification');
        console.error('Error deleting notification:', error);
      }
    });
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.isRead);
  }

  trackByNotification(index: number, notification: Notification): number {
    return notification.id;
  }

  getNotificationIcon(type: NotificationType): string {
    const icons = {
      'INFO': 'ℹ️',
      'SUCCESS': '✅',
      'WARNING': '⚠️',
      'ERROR': '❌',
      'ISSUE_ASSIGNED': '📋',
      'ISSUE_UPDATED': '🔄',
      'ISSUE_RESOLVED': '✅',
      'NEW_MESSAGE': '💬',
      'ASSET_ALLOCATED': '📦',
      'ASSET_RETURNED': '↩️',
      'MAINTENANCE_DUE': '🔧',
      'WARRANTY_EXPIRING': '⏰',
      'SYSTEM_ALERT': '🔔'
    };
    return icons[type] || 'ℹ️';
  }

  getNotificationIconClass(type: NotificationType): string {
    const classes = {
      'INFO': 'info',
      'SUCCESS': 'success',
      'WARNING': 'warning',
      'ERROR': 'error',
      'ISSUE_ASSIGNED': 'issue',
      'ISSUE_UPDATED': 'issue',
      'ISSUE_RESOLVED': 'success',
      'NEW_MESSAGE': 'message',
      'ASSET_ALLOCATED': 'asset',
      'ASSET_RETURNED': 'asset',
      'MAINTENANCE_DUE': 'maintenance',
      'WARRANTY_EXPIRING': 'warning',
      'SYSTEM_ALERT': 'system'
    };
    return classes[type] || 'info';
  }

  getTypeClass(type: NotificationType): string {
    return this.getNotificationIconClass(type);
  }

  getTypeLabel(type: NotificationType): string {
    const labels = {
      'INFO': 'Info',
      'SUCCESS': 'Success',
      'WARNING': 'Warning',
      'ERROR': 'Error',
      'ISSUE_ASSIGNED': 'Issue',
      'ISSUE_UPDATED': 'Issue',
      'ISSUE_RESOLVED': 'Resolved',
      'NEW_MESSAGE': 'Message',
      'ASSET_ALLOCATED': 'Asset',
      'ASSET_RETURNED': 'Asset',
      'MAINTENANCE_DUE': 'Maintenance',
      'WARRANTY_EXPIRING': 'Warranty',
      'SYSTEM_ALERT': 'System'
    };
    return labels[type] || 'Info';
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }
}