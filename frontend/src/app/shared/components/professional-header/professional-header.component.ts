import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-professional-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="professional-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="header-title">{{ title }}</h1>
          <p class="header-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <div class="header-actions" *ngIf="showActions">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>
      <div class="header-stats" *ngIf="stats && stats.length > 0">
        <div class="stat-card" *ngFor="let stat of stats">
          <div class="stat-icon" [innerHTML]="stat.icon"></div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .professional-header {
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
      color: white;
      padding: var(--space-8) var(--space-6);
      margin: calc(-1 * var(--space-6)) calc(-1 * var(--space-6)) var(--space-8) calc(-1 * var(--space-6));
      border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
    }

    .header-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 var(--space-2) 0;
      letter-spacing: -0.025em;
    }

    .header-subtitle {
      font-size: 1.125rem;
      opacity: 0.9;
      margin: 0;
      font-weight: 400;
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
    }

    .header-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .stat-icon {
      font-size: 1.5rem;
      opacity: 0.9;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      opacity: 0.8;
      margin-top: var(--space-1);
    }

    @media (max-width: 768px) {
      .professional-header {
        padding: var(--space-6) var(--space-4);
        margin: calc(-1 * var(--space-4)) calc(-1 * var(--space-4)) var(--space-6) calc(-1 * var(--space-4));
      }

      .header-content {
        flex-direction: column;
        gap: var(--space-4);
      }

      .header-title {
        font-size: 2rem;
      }

      .header-stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfessionalHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() stats: Array<{icon: string, value: string, label: string}> = [];
  @Input() showActions: boolean = true;
}