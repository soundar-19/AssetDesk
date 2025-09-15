import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modern-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modern-card" [class]="cardClass">
      <div class="card-header" *ngIf="showHeader">
        <div class="card-title-section">
          <h3 class="card-title">{{ title }}</h3>
          <p class="card-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <div class="card-actions" *ngIf="showActions">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="showFooter">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .modern-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
      transition: var(--transition-fast);
    }

    .modern-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
      border-color: var(--gray-300);
    }

    .modern-card.elevated {
      box-shadow: var(--shadow-lg);
    }

    .modern-card.bordered {
      border: 1px solid var(--primary-300);
      background: var(--primary-25);
    }

    .card-header {
      padding: var(--space-6);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: var(--gray-25);
    }

    .card-title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0;
    }

    .card-subtitle {
      font-size: var(--text-sm);
      color: var(--gray-600);
      margin: var(--space-1) 0 0 0;
    }

    .card-actions {
      display: flex;
      gap: var(--space-2);
    }

    .card-body {
      padding: var(--space-6);
    }

    .card-footer {
      padding: var(--space-4) var(--space-6);
      background: var(--gray-25);
      border-top: 1px solid var(--gray-200);
    }

    @media (max-width: 768px) {
      .card-header {
        flex-direction: column;
        gap: var(--space-4);
        align-items: stretch;
      }

      .card-actions {
        justify-content: flex-end;
      }
    }
  `]
})
export class ModernCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() cardClass: string = '';
  @Input() showHeader: boolean = true;
  @Input() showActions: boolean = true;
  @Input() showFooter: boolean = false;
}