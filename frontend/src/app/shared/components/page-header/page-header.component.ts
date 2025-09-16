import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="header-nav" *ngIf="showBackButton">
        <button class="btn-back" (click)="goBack()">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          {{ backButtonText }}
        </button>
      </div>
      
      <div class="header-content">
        <div class="header-main">
          <h1 class="header-title">{{ title }}</h1>
          <p class="header-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
          <div class="header-meta" *ngIf="metaInfo">
            <ng-content select="[slot=meta]"></ng-content>
          </div>
        </div>
        <div class="header-actions" *ngIf="showActions">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      margin-bottom: var(--space-6);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .header-nav {
      margin-bottom: var(--space-4);
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: var(--gray-100);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      color: var(--gray-700);
      font-size: var(--text-sm);
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .btn-back:hover {
      background: var(--gray-200);
      color: var(--gray-900);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
    }

    .header-main {
      flex: 1;
      min-width: 0;
    }

    .header-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--gray-900);
      margin: 0 0 var(--space-2) 0;
      line-height: var(--leading-tight);
    }

    .header-subtitle {
      font-size: var(--text-base);
      color: var(--gray-600);
      margin: 0 0 var(--space-2) 0;
      line-height: 1.5;
    }

    .header-meta {
      margin-top: var(--space-2);
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .page-header {
        padding: var(--space-4);
      }

      .header-content {
        flex-direction: column;
        gap: var(--space-3);
      }

      .header-title {
        font-size: var(--text-xl);
      }

      .header-actions {
        width: 100%;
        justify-content: flex-start;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showBackButton: boolean = false;
  @Input() backButtonText: string = 'Back';
  @Input() backRoute: string = '';
  @Input() showActions: boolean = true;
  @Input() metaInfo: boolean = false;
  @Output() backClick = new EventEmitter<void>();

  constructor(private router: Router) {}

  goBack() {
    if (this.backClick.observers.length > 0) {
      this.backClick.emit();
    } else if (this.backRoute) {
      this.router.navigate([this.backRoute]);
    } else {
      window.history.back();
    }
  }
}