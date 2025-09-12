import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner" [class]="size">
      <div class="spinner"></div>
      <span *ngIf="text" class="loading-text">{{ text }}</span>
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
    }
    
    .spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid var(--gray-200);
      border-top: 3px solid var(--primary-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .loading-spinner.sm .spinner {
      width: 1rem;
      height: 1rem;
      border-width: 2px;
    }
    
    .loading-spinner.lg .spinner {
      width: 3rem;
      height: 3rem;
      border-width: 4px;
    }
    
    .loading-text {
      color: var(--gray-600);
      font-size: 0.875rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() text: string = '';
}