import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title class="dialog-title" [ngClass]="'title-' + (data.type || 'info')">
        {{ data.title }}
      </h2>
      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button 
                [color]="getButtonColor()"
                (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 400px;
      max-width: 500px;
    }
    
    .dialog-title {
      margin: 0 0 var(--space-6) 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    
    .title-warning {
      color: var(--warning-600);
    }
    
    .title-danger {
      color: var(--error-600);
    }
    
    .title-info {
      color: var(--primary-600);
    }
    
    .dialog-content {
      margin-bottom: var(--space-8);
      padding: 0;
    }
    
    .dialog-content p {
      margin: 0;
      color: var(--gray-700);
      font-size: 1rem;
      line-height: 1.6;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin: 0;
      padding: 0;
    }
    
    .dialog-actions button {
      min-width: 100px;
      font-weight: 600;
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast);
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'danger': return 'warn';
      case 'warning': return 'accent';
      default: return 'primary';
    }
  }
}