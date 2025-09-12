import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from '../../core/services/message.service';
import { Message } from '../../core/models';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="messages-container">
      <div class="header">
        <h2>Messages</h2>
        <button class="btn btn-primary" (click)="composeMessage()">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          Compose Message
        </button>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'received'" (click)="setActiveTab('received')">
          Received ({{ getReceivedCount() }})
        </button>
        <button class="tab" [class.active]="activeTab === 'sent'" (click)="setActiveTab('sent')">
          Sent ({{ getSentCount() }})
        </button>
      </div>

      <div class="messages-list" *ngIf="messages.length > 0; else emptyState">
        <div 
          class="message-card" 
          *ngFor="let message of messages; trackBy: trackByMessage"
          [class.unread]="!message.read && activeTab === 'received'"
          (click)="readMessage(message.id)">
          
          <div class="message-header">
            <div class="message-sender">
              {{ activeTab === 'received' ? message.sender?.name : message.recipient?.name }}
            </div>
            <div class="message-time">
              {{ getRelativeTime(message.sentAt) }}
            </div>
          </div>
          
          <div class="message-subject">{{ message.subject }}</div>
          <div class="message-preview">{{ getMessagePreview(message.content) }}</div>
          
          <div class="message-actions">
            <button class="action-btn" (click)="readMessage(message.id, $event)">
              {{ message.read ? 'View' : 'Read' }}
            </button>
            <button class="action-btn" (click)="deleteMessage(message.id, $event)">
              Delete
            </button>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📬</div>
          <h3>No messages</h3>
          <p>{{ activeTab === 'received' ? 'No messages received yet.' : 'No messages sent yet.' }}</p>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./messages-list.component.css']
})
export class MessagesListComponent implements OnInit {
  messages: Message[] = [];
  pagination: any = null;
  activeTab: 'received' | 'sent' = 'received';
  


  constructor(
    private messageService: MessageService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages(page: number = 0) {
    const request = this.activeTab === 'received' 
      ? this.messageService.getReceivedMessages(page, 10)
      : this.messageService.getSentMessages(page, 10);

    request.subscribe({
      next: (response) => {
        this.messages = response.content;
        this.pagination = {
          page: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        };
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.messages = [];
        this.pagination = { page: 0, totalPages: 0, totalElements: 0 };
      }
    });
  }

  onPageChange(page: number) {
    this.loadMessages(page);
  }

  setActiveTab(tab: 'received' | 'sent') {
    this.activeTab = tab;
    this.loadMessages();
  }

  composeMessage() {
    this.router.navigate(['/messages/compose']);
  }

  readMessage(id: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/messages', id]);
  }

  deleteMessage(id: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        this.toastService.success('Message deleted');
        this.loadMessages();
      }
    });
  }

  trackByMessage(index: number, message: Message): number {
    return message.id;
  }

  getMessagePreview(content: string): string {
    return content?.length > 120 ? content.substring(0, 120) + '...' : content || '';
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

  getReceivedCount(): number {
    return this.activeTab === 'received' ? (this.pagination?.totalElements || 0) : 0;
  }

  getSentCount(): number {
    return this.activeTab === 'sent' ? (this.pagination?.totalElements || 0) : 0;
  }
}