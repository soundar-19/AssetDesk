import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-professional-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="professional-card" [class]="cardClass" [class.clickable]="clickable">
      <div class="card-content">
        <div class="card-header" *ngIf="title || subtitle">
          <div class="header-content">
            <h3 class="card-title" *ngIf="title">{{ title }}</h3>
            <p class="card-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
          </div>
          <div class="header-actions" *ngIf="showActions">
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
    </div>
  `,
  styles: [`
    .professional-card {
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      transition: var(--transition-fast);
      overflow: hidden;
    }

    .professional-card.clickable {
      cursor: pointer;
    }

    .professional-card:hover {
      border-color: var(--gray-300);
      box-shadow: var(--shadow-md);
    }

    .professional-card.clickable:hover {
      transform: translateY(-1px);
    }

    .professional-card.variant-outlined {
      border: 2px solid var(--primary-200);
      background: var(--primary-25);
    }

    .professional-card.variant-elevated {
      box-shadow: var(--shadow-lg);
      border: none;
    }

    .professional-card.variant-flat {
      box-shadow: none;
      border: 1px solid var(--gray-100);
    }

    .card-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card-header {
      padding: var(--space-5) var(--space-6) var(--space-4);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
    }

    .header-content {
      flex: 1;
      min-width: 0;
    }

    .card-title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0;
      line-height: var(--leading-tight);
    }

    .card-subtitle {
      font-size: var(--text-sm);
      color: var(--gray-600);
      margin: var(--space-1) 0 0 0;
      line-height: var(--leading-normal);
    }

    .header-actions {
      display: flex;
      gap: var(--space-2);
      align-items: flex-start;
      flex-shrink: 0;
    }

    .card-body {
      padding: 0 var(--space-6) var(--space-6);
      flex: 1;
    }

    .card-footer {
      padding: var(--space-4) var(--space-6);
      background: var(--gray-25);
      border-top: 1px solid var(--gray-100);
      margin-top: auto;
    }

    @media (max-width: 640px) {
      .card-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-3);
      }

      .header-actions {
        justify-content: flex-end;
      }
    }
  `]
})
export class ProfessionalCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() cardClass: string = '';
  @Input() clickable: boolean = false;
  @Input() showActions: boolean = false;
  @Input() showFooter: boolean = false;
}