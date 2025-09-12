import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast } from './toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private addToast(toast: Toast) {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration || 5000);
    }
  }

  success(message: string, duration?: number) {
    this.addToast({
      id: this.generateId(),
      message,
      type: 'success',
      duration
    });
  }

  error(message: string, duration?: number) {
    this.addToast({
      id: this.generateId(),
      message,
      type: 'error',
      duration
    });
  }

  warning(message: string, duration?: number) {
    this.addToast({
      id: this.generateId(),
      message,
      type: 'warning',
      duration
    });
  }

  info(message: string, duration?: number) {
    this.addToast({
      id: this.generateId(),
      message,
      type: 'info',
      duration
    });
  }

  removeToast(id: string) {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clear() {
    this.toastsSubject.next([]);
  }
}