import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class.overlay]="overlay">
      <div class="spinner" [style.width.px]="size" [style.height.px]="size">
        <div class="spinner-border" [style.color]="color"></div>
      </div>
      <div *ngIf="message" class="spinner-message">{{ message }}</div>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      min-height: 120px;
    }
    
    .spinner-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(2px);
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }
    
    .spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .spinner-border {
      width: 100%;
      height: 100%;
      border: 3px solid var(--gray-200);
      border-top: 3px solid currentColor;
      border-radius: 50%;
      animation: spin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
    }
    
    .spinner-message {
      margin-top: var(--space-4);
      color: var(--gray-600);
      font-size: 0.875rem;
      font-weight: 500;
      text-align: center;
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes spin {
      0% { 
        transform: rotate(0deg);
      }
      100% { 
        transform: rotate(360deg);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.6;
      }
    }
    
    @media (prefers-reduced-motion: reduce) {
      .spinner-border {
        animation: spin 1.5s linear infinite;
      }
      
      .spinner-message {
        animation: none;
      }
      
      .spinner-container.overlay {
        animation: none;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: number = 40;
  @Input() color: string = '#007bff';
  @Input() message: string = '';
  @Input() overlay: boolean = false;
}