import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metric-card" [class]="variant" (click)="handleClick()">
      <div class="metric-info">
        <span class="metric-value">{{ value }}</span>
        <span class="metric-label">{{ label }}</span>
        <span class="metric-trend" *ngIf="trend">{{ trend }}</span>
      </div>
    </div>
  `,
  styles: [`
    .metric-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      cursor: pointer;
      transition: var(--transition-fast);
      position: relative;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 4px;
      background: var(--card-color);
      border-radius: var(--radius-xl) 0 0 var(--radius-xl);
    }
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--card-color);
    }
    .metric-card.primary { --card-color: var(--primary-600); }
    .metric-card.success { --card-color: var(--success-600); }
    .metric-card.warning { --card-color: var(--warning-600); }
    .metric-card.info { --card-color: var(--info-600); }
    .metric-card.secondary { --card-color: var(--gray-600); }
    .metric-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--space-1);
      width: 100%;
    }
    .metric-value {
      font-size: 1.5rem;
      font-weight: var(--font-bold);
      color: var(--gray-900);
      line-height: var(--leading-none);
      margin: 0;
    }
    .metric-label {
      font-size: var(--text-xs);
      color: var(--gray-600);
      font-weight: var(--font-medium);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-trend {
      font-size: var(--text-xs);
      color: var(--card-color);
      font-weight: var(--font-medium);
      background: rgba(255, 255, 255, 0.8);
      padding: 2px var(--space-2);
      border-radius: var(--radius-md);
      border: 1px solid var(--card-color);
      margin-top: var(--space-1);
    }
  `]
})
export class MetricCardComponent {
  @Input() value: string | number = 0;
  @Input() label: string = '';
  @Input() trend?: string;
  @Input() variant: 'primary' | 'success' | 'warning' | 'info' | 'secondary' = 'primary';
  @Output() cardClick = new EventEmitter<void>();

  handleClick() {
    this.cardClick.emit();
  }
}