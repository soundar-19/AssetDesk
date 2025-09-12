import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService } from './toast.service';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast"
           [ngClass]="'toast-' + toast.type">
        <div class="toast-content">
          <span class="toast-icon">{{ getIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="removeToast(toast.id)">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: var(--space-6);
      right: var(--space-6);
      z-index: 1050;
      max-width: 400px;
      width: 100%;
    }
    
    .toast {
      margin-bottom: var(--space-3);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      overflow: hidden;
    }
    
    .toast-content {
      display: flex;
      align-items: center;
      padding: var(--space-4) var(--space-5);
      color: white;
      position: relative;
    }
    
    .toast-success {
      background: linear-gradient(135deg, var(--success-600), var(--success-700));
    }
    
    .toast-error {
      background: linear-gradient(135deg, var(--error-600), var(--error-700));
    }
    
    .toast-warning {
      background: linear-gradient(135deg, var(--warning-600), var(--warning-700));
    }
    
    .toast-info {
      background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
    }
    
    .toast-icon {
      margin-right: var(--space-3);
      font-weight: bold;
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
    }
    
    .toast-message {
      flex: 1;
      font-weight: 500;
      font-size: 0.875rem;
      line-height: 1.4;
    }
    
    .toast-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 1.125rem;
      cursor: pointer;
      margin-left: var(--space-3);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      opacity: 0.8;
    }
    
    .toast-close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translateX(0) scale(1);
        opacity: 1;
      }
    }
    
    @media (max-width: 768px) {
      .toast-container {
        top: var(--space-4);
        right: var(--space-4);
        left: var(--space-4);
        max-width: none;
      }
      
      .toast-content {
        padding: var(--space-3) var(--space-4);
      }
      
      .toast-message {
        font-size: 0.8125rem;
      }
    }
    
    @media (prefers-reduced-motion: reduce) {
      .toast {
        animation: fadeIn 0.3s ease-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription.add(
      this.toastService.toasts$.subscribe(toasts => {
        this.toasts = toasts;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  }

  removeToast(id: string) {
    this.toastService.removeToast(id);
  }
}