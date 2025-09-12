import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Notification, PageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private endpoint = '/notifications';

  constructor(private api: ApiService, private auth: AuthService) {}

  getNotifications(page: number = 0, size: number = 10): Observable<PageResponse<Notification>> {
    const user = this.auth.getCurrentUser();
    if (!user?.id) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.api.get<Notification[]>(`${this.endpoint}/user/${user.id}`).pipe(
      map(notifications => ({
        content: notifications,
        totalElements: notifications.length,
        totalPages: 1,
        number: 0
      } as PageResponse<Notification>))
    );
  }

  getUnreadNotifications(page: number = 0, size: number = 10): Observable<PageResponse<Notification>> {
    const user = this.auth.getCurrentUser();
    if (!user?.id) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.api.get<Notification[]>(`${this.endpoint}/user/${user.id}/unread`).pipe(
      map(notifications => ({
        content: notifications,
        totalElements: notifications.length,
        totalPages: 1,
        number: 0
      } as PageResponse<Notification>))
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.api.put<void>(`${this.endpoint}/${id}/read`, null);
  }

  markAllAsRead(): Observable<void> {
    const user = this.auth.getCurrentUser();
    if (!user?.id) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.api.put<void>(`${this.endpoint}/user/${user.id}/read-all`, null);
  }

  deleteNotification(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getUnreadCount(): Observable<number> {
    const user = this.auth.getCurrentUser();
    if (!user?.id) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.api.get<number>(`${this.endpoint}/user/${user.id}/unread/count`);
  }
}