import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IssueService } from '../../../core/services/issue.service';
import { MessageService } from '../../../core/services/message.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-issue-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="chat-layout">


      <!-- Messages Area -->
      <div class="messages-container" #messagesContainer>
        <div class="messages-list">
          <div *ngFor="let message of messages" class="message-wrapper" 
               [class.own-message]="message.senderId == currentUserId"
               [class.system-message]="message.messageType === 'SYSTEM_MESSAGE'">
            <div class="message-bubble" *ngIf="message.messageType !== 'SYSTEM_MESSAGE'">
              <div class="message-header">
                <span class="sender-name">{{ message.senderName }}</span>
                <span class="message-time">{{ message.timestamp | date:'MMM d, h:mm a' }}</span>
              </div>
              
              <div class="message-body">
                <p *ngIf="message.messageText" class="message-text">{{ message.messageText }}</p>
                
                <!-- Attachments -->
                <div *ngIf="message.hasImage" class="attachment">
                  <!-- Images -->
                  <div *ngIf="message.imageType?.startsWith('image/')" class="image-attachment">
                    <img [src]="'http://localhost:8080/api/messages/image/' + message.id" 
                         class="attachment-image" 
                         (click)="viewImage('http://localhost:8080/api/messages/image/' + message.id)"
                         (error)="onImageError($event, message.id)">
                  </div>
                  
                  <!-- Files -->
                  <div *ngIf="!message.imageType?.startsWith('image/')" class="file-attachment">
                    <div class="file-icon">
                      <svg *ngIf="message.imageType === 'application/pdf'" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                      <svg *ngIf="message.imageType?.startsWith('video/')" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
                      </svg>
                      <svg *ngIf="!message.imageType?.startsWith('video/') && message.imageType !== 'application/pdf'" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                    </div>
                    <div class="file-info">
                      <a [href]="'http://localhost:8080/api/messages/file/' + message.id" target="_blank" class="file-name">
                        {{ message.fileName || 'Download File' }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- System Message -->
            <div class="system-message-bubble" *ngIf="message.messageType === 'SYSTEM_MESSAGE'">
              <div class="system-icon">🤖</div>
              <div class="system-content">
                <span class="system-text">{{ message.messageText }}</span>
                <span class="system-time">{{ message.timestamp | date:'MMM d, h:mm a' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input-area">
        <div *ngIf="issue?.status === 'RESOLVED' || issue?.status === 'CLOSED'" class="chat-disabled">
          <div class="disabled-message">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
            </svg>
            <span>This issue has been {{ issue.status.toLowerCase() }}. Chat is disabled.</span>
          </div>
          <button *ngIf="issue?.status === 'RESOLVED'" class="close-issue-btn" (click)="closeIssue()">
            Close Issue
          </button>
        </div>

        <form *ngIf="issue?.status !== 'RESOLVED' && issue?.status !== 'CLOSED'" 
              [formGroup]="messageForm" 
              (ngSubmit)="sendMessage()" 
              class="message-form">
          
          <div *ngIf="selectedFile" class="file-preview">
            <div class="preview-content">
              <img *ngIf="fileType.startsWith('image/')" [src]="filePreview" class="preview-image">
              <div *ngIf="!fileType.startsWith('image/')" class="preview-file">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                <span>{{ filePreview }}</span>
              </div>
            </div>
            <button type="button" class="remove-file-btn" (click)="removeFile()">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>

          <div class="input-container">
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="*" style="display: none;">
            <button type="button" class="attach-btn" (click)="fileInput.click()">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"/>
              </svg>
            </button>
            <input type="text" 
                   formControlName="message" 
                   placeholder="Type your message..." 
                   class="message-input">
            <button type="submit" 
                    class="send-btn" 
                    [disabled]="!messageForm.value.message && !selectedFile">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Image Modal -->
    <div *ngIf="showImageModal" class="image-modal" (click)="closeModal()">
      <div class="modal-backdrop"></div>
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closeModal()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        <img [src]="modalImageUrl" class="modal-image">
      </div>
    </div>
  `,
  styles: [`
    .chat-layout {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
      position: relative;
    }



    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      padding-bottom: 120px;
      background: #f8fafc;
      min-height: 0;
    }

    .messages-list {
      max-width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .message-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
    }

    .message-wrapper.own-message {
      flex-direction: row-reverse;
    }

    .message-bubble {
      max-width: 65%;
      background: white;
      border-radius: 1.25rem;
      padding: 1rem 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
      position: relative;
    }

    .own-message .message-bubble {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: 1px solid #2563eb;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06);
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .sender-name {
      font-weight: 600;
      font-size: 0.875rem;
    }

    .own-message .sender-name {
      color: var(--primary-100);
    }

    .message-time {
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .message-text {
      margin: 0;
      line-height: 1.5;
    }

    .attachment {
      margin-top: var(--space-2);
    }

    .attachment-image {
      max-width: 300px;
      max-height: 200px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: transform var(--transition-fast);
    }

    .attachment-image:hover {
      transform: scale(1.02);
    }

    .file-attachment {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      background: rgba(0, 0, 0, 0.03);
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      transition: background var(--transition-fast);
    }

    .file-attachment:hover {
      background: rgba(0, 0, 0, 0.06);
    }

    .own-message .file-attachment {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .own-message .file-attachment:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .file-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--gray-100);
      border-radius: var(--radius-md);
      color: var(--gray-600);
    }

    .own-message .file-icon {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .file-name {
      color: inherit;
      text-decoration: none;
      font-weight: 500;
    }

    .file-name:hover {
      text-decoration: underline;
    }

    .chat-input-area {
      padding: var(--space-4) var(--space-6);
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid var(--gray-200);
      z-index: 10;
    }

    .chat-disabled {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4);
      background: var(--gray-50);
      border-radius: var(--radius-lg);
    }

    .disabled-message {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--gray-600);
    }

    .close-issue-btn {
      padding: var(--space-2) var(--space-4);
      background: var(--primary-500);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: background var(--transition-fast);
    }

    .close-issue-btn:hover {
      background: var(--primary-600);
    }

    .message-form {
      width: 100%;
    }

    .file-preview {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      background: var(--gray-50);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-3);
    }

    .preview-content {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .preview-image {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }

    .preview-file {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--gray-600);
    }

    .remove-file-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: var(--gray-200);
      border-radius: var(--radius-full);
      color: var(--gray-600);
      cursor: pointer;
      margin-left: auto;
    }

    .remove-file-btn:hover {
      background: var(--gray-300);
    }

    .input-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: white;
      border-radius: 1.5rem;
      border: 2px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
    }

    .input-container:focus-within {
      border-color: #3b82f6;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06), 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .attach-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      color: var(--gray-500);
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .attach-btn:hover {
      background: var(--gray-200);
      color: var(--gray-700);
    }

    .message-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: var(--space-2) var(--space-3);
      font-size: 1rem;
      outline: none;
    }

    .send-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      color: white;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }

    .send-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .send-btn:disabled {
      background: var(--gray-300);
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    .image-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
    }

    .modal-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
    }

    .modal-close {
      position: absolute;
      top: -50px;
      right: 0;
      width: 40px;
      height: 40px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border-radius: var(--radius-full);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-image {
      max-width: 100%;
      max-height: 100%;
      border-radius: var(--radius-lg);
    }

    .message-wrapper.system-message {
      justify-content: center;
      margin: var(--space-4) 0;
    }

    .system-message-bubble {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      background: var(--gray-100);
      border-radius: var(--radius-xl);
      border: 1px solid var(--gray-200);
      max-width: 80%;
    }

    .system-icon {
      font-size: 1rem;
    }

    .system-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .system-text {
      color: var(--gray-700);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .system-time {
      color: var(--gray-500);
      font-size: 0.75rem;
    }
  `]
})
export class IssueChatComponent implements OnInit {
  @Input() issueId: number = 0;
  messageForm: FormGroup;
  issue: any = null;
  messages: any[] = [];
  currentUserId: number;
  selectedFile: File | null = null;
  filePreview: string | null = null;
  fileType: string = '';
  showImageModal = false;
  modalImageUrl = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private issueService: IssueService,
    private messageService: MessageService,
    private toastService: ToastService
  ) {
    this.currentUserId = Number(this.authService.getCurrentUser()?.id) || 0;
    this.messageForm = this.fb.group({
      message: ['']
    });
  }

  ngOnInit() {
    if (!this.issueId) {
      this.issueId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    }
    this.loadIssue();
    this.loadMessages();
  }

  loadIssue() {
    this.issueService.getIssueById(this.issueId).subscribe({
      next: (issue) => this.issue = issue,
      error: () => this.toastService.error('Failed to load issue')
    });
  }

  loadMessages() {
    this.messageService.getMessagesByIssue(this.issueId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.scrollToBottom();
      },
      error: () => this.toastService.error('Failed to load messages')
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileType = file.type;
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => this.filePreview = e.target?.result as string;
        reader.readAsDataURL(file);
      } else {
        this.filePreview = file.name;
      }
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.filePreview = null;
    this.fileType = '';
  }

  sendMessage() {
    if (this.messageForm.value.message || this.selectedFile) {
      const currentUser = this.authService.getCurrentUser();
      const formData = new FormData();
      formData.append('issueId', this.issueId.toString());
      formData.append('message', this.messageForm.value.message || '');
      formData.append('senderId', currentUser?.id?.toString() || '0');
      
      if (this.selectedFile) {
        console.log('Sending file:', this.selectedFile.name, this.selectedFile.size, this.selectedFile.type);
        formData.append('image', this.selectedFile);
      }
      
      console.log('FormData contents:');
      formData.forEach((value, key) => {
        console.log(key, value);
      });

      this.messageService.sendIssueMessageWithFile(formData).subscribe({
        next: () => {
          this.messageForm.reset();
          this.removeFile();
          this.loadMessages();
        },
        error: (error) => {
          console.error('Failed to send message:', error);
          this.toastService.error('Failed to send message');
        }
      });
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }



  onImageError(event: any, messageId: number) {
    const fullUrl = window.location.origin + '/api/messages/image/' + messageId;
    console.error('Image failed to load for message', messageId);
    console.log('Relative URL:', '/api/messages/image/' + messageId);
    console.log('Full URL:', fullUrl);
    console.log('Event:', event);
    event.target.style.display = 'none';
  }

  viewImage(imageUrl: string) {
    this.modalImageUrl = imageUrl;
    this.showImageModal = true;
  }



  closeModal() {
    this.showImageModal = false;
    this.modalImageUrl = '';
  }

  zoomImage(scale: string) {
    const img = document.querySelector('.modal-image') as HTMLElement;
    if (img) {
      img.style.transform = `scale(${scale})`;
    }
  }

  closeIssue() {
    this.issueService.closeIssue(this.issueId, this.currentUserId).subscribe({
      next: () => {
        this.toastService.success('Issue closed successfully');
        this.loadIssue(); // Reload to update status
      },
      error: () => this.toastService.error('Failed to close issue')
    });
  }

  goBack() {
    this.router.navigate(['/issues']);
  }
}