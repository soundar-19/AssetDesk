import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-icon">{{ icon }}</div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <button *ngIf="actionText" 
              class="btn btn-primary" 
              (click)="onAction()">
        {{ actionText }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      text-align: center;
      padding: var(--space-16) var(--space-8);
      color: var(--gray-600);
      max-width: 500px;
      margin: 0 auto;
    }
    
    .empty-icon {
      font-size: 5rem;
      margin-bottom: var(--space-6);
      opacity: 0.6;
      display: block;
      line-height: 1;
    }
    
    .empty-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 var(--space-4) 0;
      color: var(--gray-900);
      line-height: 1.2;
    }
    
    .empty-description {
      font-size: 1.125rem;
      line-height: 1.6;
      margin: 0 0 var(--space-8) 0;
      color: var(--gray-600);
    }
    
    .btn {
      padding: var(--space-4) var(--space-8);
      border: 1px solid transparent;
      border-radius: var(--radius-lg);
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }
    
    .btn-primary {
      background: var(--primary-600);
      color: white;
      border-color: var(--primary-600);
    }
    
    .btn-primary:hover {
      background: var(--primary-700);
      border-color: var(--primary-700);
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }
    
    .btn-primary:active {
      transform: translateY(0);
      box-shadow: var(--shadow-md);
    }
    
    @media (max-width: 768px) {
      .empty-state {
        padding: var(--space-12) var(--space-4);
      }
      
      .empty-icon {
        font-size: 4rem;
      }
      
      .empty-title {
        font-size: 1.5rem;
      }
      
      .empty-description {
        font-size: 1rem;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = '📭';
  @Input() title: string = 'No data available';
  @Input() description: string = 'There are no items to display at the moment.';
  @Input() actionText: string = '';
  
  @Output() action = new EventEmitter<void>();

  onAction() {
    this.action.emit();
  }
}