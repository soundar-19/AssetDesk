import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-field" [class.full-width]="fullWidth">
      <label [for]="fieldId" [class]="'field-label ' + (required ? 'required' : 'optional')">
        <svg *ngIf="icon" class="label-icon" width="16" height="16" [innerHTML]="getIcon(icon)"></svg>
        {{ label }}
      </label>
      
      <div class="input-wrapper" *ngIf="type !== 'select' && type !== 'textarea'">
        <input
          [id]="fieldId"
          [type]="type"
          [formControl]="control"
          class="form-input"
          [class.error]="control.invalid && control.touched"
          [placeholder]="placeholder"
          [min]="min"
          [max]="max"
          [step]="step">
      </div>
      
      <div class="select-wrapper" *ngIf="type === 'select'">
        <select
          [id]="fieldId"
          [formControl]="control"
          class="form-select"
          [class.error]="control.invalid && control.touched">
          <option value="" *ngIf="placeholder">{{ placeholder }}</option>
          <option *ngFor="let option of options" [value]="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <div class="input-wrapper" *ngIf="type === 'textarea'">
        <textarea
          [id]="fieldId"
          [formControl]="control"
          class="form-textarea"
          [class.error]="control.invalid && control.touched"
          [placeholder]="placeholder"
          [rows]="rows || 4">
        </textarea>
      </div>
      
      <div *ngIf="helpText" class="field-help">
        <svg class="help-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        {{ helpText }}
      </div>
      
      <div *ngIf="control.invalid && control.touched" class="field-error">
        <svg class="error-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        {{ getErrorMessage() }}
      </div>
    </div>
  `,
  styles: []
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() fieldId: string = '';
  @Input() type: string = 'text';
  @Input() control!: FormControl;
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() icon: string = '';
  @Input() helpText: string = '';
  @Input() fullWidth: boolean = false;
  @Input() options: { value: any; label: string }[] = [];
  @Input() min: string | number = '';
  @Input() max: string | number = '';
  @Input() step: string | number = '';
  @Input() rows: number = 4;

  getErrorMessage(): string {
    if (this.control.errors) {
      if (this.control.errors['required']) {
        return `${this.label} is required`;
      }
      if (this.control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (this.control.errors['minlength']) {
        return `${this.label} must be at least ${this.control.errors['minlength'].requiredLength} characters`;
      }
      if (this.control.errors['min']) {
        return `${this.label} must be at least ${this.control.errors['min'].min}`;
      }
      if (this.control.errors['max']) {
        return `${this.label} cannot exceed ${this.control.errors['max'].max}`;
      }
    }
    return 'Invalid input';
  }

  getIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      'user': '<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>',
      'email': '<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>',
      'phone': '<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>',
      'building': '<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 8a1 1 0 011-1h4a1 1 0 011 1v4H7v-4z" clip-rule="evenodd"/>',
      'tag': '<path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>',
      'calendar': '<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>',
      'currency': '<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>',
      'lock': '<path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>',
      'shield': '<path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1z" clip-rule="evenodd"/>',
      'check': '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>'
    };
    return icons[iconName] || '';
  }
}