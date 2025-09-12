import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  constructor(private dialog: MatDialog) {}

  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data,
      disableClose: true
    });

    return dialogRef.afterClosed();
  }

  confirmDelete(itemName: string = 'item'): Observable<boolean> {
    return this.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
  }

  confirmAction(title: string, message: string, confirmText: string = 'Confirm'): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      type: 'warning'
    });
  }
}