import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  constructor(private dialog: MatDialog) {}

  confirm(title: string, message: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      maxWidth: '90vw',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop',
      panelClass: 'confirm-dialog-panel',
      data: { 
        title, 
        message,
        type: 'info',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
      }
    });
    
    return dialogRef.afterClosed();
  }

  confirmDelete(itemName: string = 'item'): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      maxWidth: '90vw',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop',
      panelClass: 'confirm-dialog-panel',
      data: { 
        title: 'Confirm Delete', 
        message: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });
    
    return dialogRef.afterClosed();
  }

  confirmAction(title: string, message: string, confirmText: string = 'Confirm'): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      maxWidth: '90vw',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop',
      panelClass: 'confirm-dialog-panel',
      data: { 
        title, 
        message,
        type: 'warning',
        confirmText,
        cancelText: 'Cancel'
      }
    });
    
    return dialogRef.afterClosed();
  }
}