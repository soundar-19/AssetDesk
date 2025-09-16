import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ResolveModalResult {
  notes: string;
  cost?: number;
}

@Component({
  selector: 'app-resolve-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="visible" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Resolve Issue</h3>
          <button class="close-btn" (click)="onCancel()" type="button">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="notes">Resolution Notes *</label>
            <textarea 
              id="notes"
              [(ngModel)]="notes"
              placeholder="Describe how the issue was resolved..."
              class="form-control"
              rows="4"
              required>
            </textarea>
          </div>
          
          <div class="form-group">
            <label for="cost">Cost (Optional)</label>
            <input 
              id="cost"
              [(ngModel)]="cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter cost if applicable"
              class="form-control">
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onCancel()" type="button">
            Cancel
          </button>
          <button 
            class="btn btn-primary" 
            (click)="onConfirm()" 
            type="button"
            [disabled]="!notes.trim()">
            Resolve Issue
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-6);
      border-bottom: 1px solid var(--gray-200);
    }

    .modal-header h3 {
      margin: 0;
      color: var(--gray-900);
      font-size: 1.125rem;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--gray-500);
      padding: var(--space-1);
      border-radius: var(--radius-sm);
    }

    .close-btn:hover {
      color: var(--gray-700);
      background: var(--gray-100);
    }

    .modal-body {
      padding: var(--space-6);
      flex: 1;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: var(--space-4);
    }

    .form-group label {
      display: block;
      margin-bottom: var(--space-2);
      font-weight: 500;
      color: var(--gray-700);
    }

    .form-control {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-6);
      border-top: 1px solid var(--gray-200);
    }

    .btn {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary-600);
      color: white;
      border-color: var(--primary-600);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-700);
      border-color: var(--primary-700);
    }

    .btn-secondary {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
    }

    .btn-secondary:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }
  `]
})
export class ResolveModalComponent {
  @Input() visible = false;
  @Output() confirm = new EventEmitter<ResolveModalResult>();
  @Output() cancel = new EventEmitter<void>();

  notes = '';
  cost: number | null = null;

  ngOnChanges() {
    if (this.visible) {
      this.notes = '';
      this.cost = null;
    }
  }

  onConfirm() {
    if (this.notes.trim()) {
      this.confirm.emit({
        notes: this.notes.trim(),
        cost: this.cost || undefined
      });
      this.visible = false;
    }
  }

  onCancel() {
    this.cancel.emit();
    this.visible = false;
  }
}