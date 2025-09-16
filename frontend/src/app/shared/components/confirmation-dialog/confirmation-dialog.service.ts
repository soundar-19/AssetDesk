import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private showSubject = new BehaviorSubject<boolean>(false);
  private configSubject = new BehaviorSubject<ConfirmationConfig>({
    title: 'Confirm Action',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  show$ = this.showSubject.asObservable();
  config$ = this.configSubject.asObservable();

  private resolvePromise: ((value: boolean) => void) | null = null;

  confirm(config: ConfirmationConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.configSubject.next({
        ...config,
        confirmText: config.confirmText || 'Confirm',
        cancelText: config.cancelText || 'Cancel'
      });
      this.showSubject.next(true);
    });
  }

  onConfirm() {
    this.showSubject.next(false);
    if (this.resolvePromise) {
      this.resolvePromise(true);
      this.resolvePromise = null;
    }
  }

  onCancel() {
    this.showSubject.next(false);
    if (this.resolvePromise) {
      this.resolvePromise(false);
      this.resolvePromise = null;
    }
  }
}