import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="show" (click)="onOverlayClick($event)">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>{{ title }}</h3>
        </div>
        
        <div class="dialog-body">
          <p>{{ message }}</p>
        </div>
        
        <div class="dialog-footer">
          <button class="btn btn-secondary" (click)="cancel()">
            {{ cancelText }}
          </button>
          <button class="btn btn-danger" (click)="confirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .dialog-content {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.4), 0 10px 25px -5px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      border: 3px solid rgba(59, 130, 246, 0.2);
      width: 90%;
      max-width: 400px;
      overflow: hidden;
    }
    
    .dialog-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    
    .dialog-header h3 {
      margin: 0;
      color: #111827;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .dialog-body {
      padding: 1.5rem;
    }
    
    .dialog-body p {
      margin: 0;
      color: #6b7280;
      line-height: 1.5;
    }
    
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      border: 1px solid transparent;
    }
    
    .btn-secondary {
      background: white;
      color: #374151;
      border-color: #d1d5db;
    }
    
    .btn-secondary:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }
    
    .btn-danger {
      background: #dc2626;
      color: white;
      border-color: #dc2626;
    }
    
    .btn-danger:hover {
      background: #b91c1c;
      border-color: #b91c1c;
    }
  `]
})
export class ConfirmationDialogComponent {
  @Input() show = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  confirm() {
    this.onConfirm.emit();
  }

  cancel() {
    this.onCancel.emit();
  }
}