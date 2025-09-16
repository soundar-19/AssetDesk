import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

export interface FormAction {
  label: string;
  type: 'button' | 'submit';
  variant: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  action?: () => void;
}

@Component({
  selector: 'app-professional-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="page-container standardized-layout" role="main">
      <header class="page-header" *ngIf="title">
        <div class="header-content">
          <div>
            <h1 class="page-title">{{ title }}</h1>
            <p class="page-description" *ngIf="description">{{ description }}</p>
          </div>
          <div class="header-actions" *ngIf="headerActions.length > 0">
            <button 
              *ngFor="let action of headerActions"
              [type]="action.type"
              [class]="'btn btn-' + action.variant + (action.size ? ' btn-' + action.size : '')"
              [disabled]="action.disabled"
              [class.btn-loading]="action.loading"
              (click)="action.action && action.action()">
              <svg *ngIf="action.icon && !action.loading" class="btn-icon" width="16" height="16" [innerHTML]="getIcon(action.icon)"></svg>
              <span *ngIf="action.loading" class="loading-spinner" aria-hidden="true"></span>
              {{ action.label }}
            </button>
          </div>
        </div>
        <div class="form-progress" *ngIf="showProgress && progressText">
          <div class="progress-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
            </svg>
          </div>
          <span class="progress-text">{{ progressText }}</span>
        </div>
      </header>

      <section class="modern-form-card" [attr.aria-label]="formAriaLabel || title + ' Form'">
        <form [formGroup]="formGroup" (ngSubmit)="onSubmit()" class="modern-form" novalidate>
          <ng-content></ng-content>
          
          <div class="form-actions" *ngIf="actions.length > 0">
            <div class="actions-wrapper">
              <button 
                *ngFor="let action of actions"
                [type]="action.type"
                [class]="'btn btn-' + action.variant + (action.size ? ' btn-' + action.size : '')"
                [disabled]="action.disabled || (action.type === 'submit' && formGroup.invalid)"
                [class.btn-loading]="action.loading"
                (click)="action.action && action.action()">
                <svg *ngIf="action.icon && !action.loading" class="btn-icon" width="16" height="16" [innerHTML]="getIcon(action.icon)"></svg>
                <span *ngIf="action.loading" class="loading-spinner" aria-hidden="true"></span>
                {{ action.label }}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  `,
  styles: []
})
export class ProfessionalFormComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() formGroup!: FormGroup;
  @Input() actions: FormAction[] = [];
  @Input() headerActions: FormAction[] = [];
  @Input() showProgress: boolean = false;
  @Input() progressText: string = '';
  @Input() formAriaLabel: string = '';

  @Output() formSubmit = new EventEmitter<any>();

  onSubmit() {
    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value);
    }
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'back': '<path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>',
      'save': '<path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>',
      'add': '<path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>',
      'cancel': '<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>',
      'check': '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>'
    };
    return icons[iconName] || '';
  }
}