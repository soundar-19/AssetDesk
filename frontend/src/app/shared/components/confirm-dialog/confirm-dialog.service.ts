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
    return new Observable(observer => {
      const result = window.confirm(`${title}\n\n${message}`);
      observer.next(result);
      observer.complete();
    });
  }

  confirmDelete(itemName: string = 'item'): Observable<boolean> {
    return this.confirm('Confirm Delete', `Are you sure you want to delete this ${itemName}? This action cannot be undone.`);
  }

  confirmAction(title: string, message: string, confirmText: string = 'Confirm'): Observable<boolean> {
    return this.confirm(title, message);
  }
}