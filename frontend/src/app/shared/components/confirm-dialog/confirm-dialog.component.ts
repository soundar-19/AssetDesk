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
      min-width: 420px;
      max-width: 520px;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(59, 130, 246, 0.1);
      background: white;
      position: relative;
      overflow: hidden;
    }
    
    .dialog-title {
      margin: 0 0 24px 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }
    
    .dialog-title::before {
      content: '';
      width: 4px;
      height: 32px;
      border-radius: 2px;
      position: absolute;
      left: -20px;
    }
    
    .title-warning::before {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }
    
    .title-danger::before {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    
    .title-info::before {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }
    
    .title-warning {
      color: #d97706;
    }
    
    .title-danger {
      color: #dc2626;
    }
    
    .title-info {
      color: #2563eb;
    }
    
    .dialog-content {
      margin-bottom: 32px;
      padding: 0;
    }
    
    .dialog-content p {
      margin: 0;
      color: #4b5563;
      font-size: 1rem;
      line-height: 1.6;
      font-weight: 400;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin: 0;
      padding: 0;
    }
    
    .dialog-actions button {
      min-width: 100px;
      height: 44px;
      font-weight: 600;
      font-size: 0.875rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    
    .dialog-actions button:first-child {
      background: #f9fafb;
      color: #6b7280;
      border: 1px solid #e5e7eb;
    }
    
    .dialog-actions button:first-child:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .dialog-actions button:last-child {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
    }
    
    .dialog-actions button:last-child:hover {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
    }
    
    .dialog-actions button[color="warn"] {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
    }
    
    .dialog-actions button[color="warn"]:hover {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      box-shadow: 0 6px 8px -1px rgba(239, 68, 68, 0.4);
    }
    
    .dialog-actions button[color="accent"] {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);
    }
    
    .dialog-actions button[color="accent"]:hover {
      background: linear-gradient(135deg, #d97706, #b45309);
      box-shadow: 0 6px 8px -1px rgba(245, 158, 11, 0.4);
    }
    
    @media (max-width: 480px) {
      .confirm-dialog {
        min-width: 320px;
        max-width: 90vw;
        padding: 24px;
      }
      
      .dialog-actions {
        flex-direction: column;
        gap: 8px;
      }
      
      .dialog-actions button {
        width: 100%;
      }
    }
    
    /* Global dialog styling */
    :host ::ng-deep .cdk-overlay-backdrop.confirm-dialog-backdrop {
      background: rgba(0, 0, 0, 0.6) !important;
      backdrop-filter: blur(4px);
    }
    
    :host ::ng-deep .mat-mdc-dialog-container.confirm-dialog-panel {
      padding: 0 !important;
      border-radius: 16px !important;
      overflow: hidden !important;
      box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
      border: 3px solid rgba(59, 130, 246, 0.15) !important;
      background: white !important;
    }
    
    :host ::ng-deep .mat-mdc-dialog-surface {
      border-radius: 16px !important;
      box-shadow: none !important;
      background: transparent !important;
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