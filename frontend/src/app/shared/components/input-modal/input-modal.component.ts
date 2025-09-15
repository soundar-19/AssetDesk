import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface InputModalConfig {
  title: string;
  message?: string;
  placeholder?: string;
  inputType?: 'text' | 'password' | 'number' | 'date' | 'textarea';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-input-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="visible" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ config.title }}</h3>
          <button class="close-btn" (click)="onCancel()" type="button">×</button>
        </div>
        
        <div class="modal-body">
          <p *ngIf="config.message" class="message">{{ config.message }}</p>
          
          <div class="input-group">
            <textarea 
              *ngIf="config.inputType === 'textarea'"
              [(ngModel)]="inputValue"
              [placeholder]="config.placeholder || ''"
              [required]="config.required || false"
              [minlength]="config.minLength || null"
              [maxlength]="config.maxLength || null"
              class="form-control textarea"
              rows="4"
              #inputElement>
            </textarea>
            
            <input 
              *ngIf="config.inputType !== 'textarea'"
              [(ngModel)]="inputValue"
              [type]="config.inputType || 'text'"
              [placeholder]="config.placeholder || ''"
              [required]="config.required || false"
              [minlength]="config.minLength || null"
              [maxlength]="config.maxLength || null"
              class="form-control"
              #inputElement>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onCancel()" type="button">
            {{ config.cancelText || 'Cancel' }}
          </button>
          <button 
            class="btn btn-primary" 
            (click)="onConfirm()" 
            type="button"
            [disabled]="!isValid()">
            {{ config.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
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
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
      from { 
        opacity: 0; 
        transform: translateY(-20px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-6);
      border-bottom: 1px solid var(--gray-200);
    }

    .modal-header h3 {
      margin: 0;
      color: var(--gray-900);
      font-size: 1.125rem;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--gray-500);
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }

    .close-btn:hover {
      color: var(--gray-700);
      background: var(--gray-100);
    }

    .modal-body {
      padding: var(--space-6);
      flex: 1;
      overflow-y: auto;
    }

    .message {
      margin: 0 0 var(--space-4) 0;
      color: var(--gray-700);
      line-height: 1.5;
    }

    .input-group {
      margin-bottom: var(--space-4);
    }

    .form-control {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      transition: border-color var(--transition-fast);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .textarea {
      resize: vertical;
      min-height: 100px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-6);
      border-top: 1px solid var(--gray-200);
    }

    .btn {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary-600);
      color: white;
      border-color: var(--primary-600);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-700);
      border-color: var(--primary-700);
    }

    .btn-secondary {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
    }

    .btn-secondary:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }

    @media (max-width: 640px) {
      .modal-content {
        width: 95%;
        margin: var(--space-4);
      }

      .modal-footer {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class InputModalComponent {
  @Input() visible = false;
  @Input() config: InputModalConfig = { title: '' };
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  inputValue = '';

  ngOnChanges() {
    if (this.visible) {
      this.inputValue = this.config.defaultValue || '';
      // Focus input after modal opens
      setTimeout(() => {
        const input = document.querySelector('.modal-content input, .modal-content textarea') as HTMLElement;
        input?.focus();
      }, 100);
    }
  }

  isValid(): boolean {
    // For non-required fields, empty values are valid
    if (!this.config.required && !this.inputValue.trim()) {
      return true;
    }
    
    // For required fields, check if value exists
    if (this.config.required && !this.inputValue.trim()) {
      return false;
    }
    
    // Check minimum length only if there's a value
    if (this.config.minLength && this.inputValue.length > 0 && this.inputValue.length < this.config.minLength) {
      return false;
    }
    
    // Check maximum length
    if (this.config.maxLength && this.inputValue.length > this.config.maxLength) {
      return false;
    }
    
    return true;
  }

  onConfirm() {
    if (this.isValid()) {
      this.confirm.emit(this.inputValue.trim());
      this.visible = false;
    }
  }

  onCancel() {
    this.cancel.emit();
    this.visible = false;
  }
}