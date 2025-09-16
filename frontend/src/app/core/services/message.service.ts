import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { Message, MessageRequest, PageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private endpoint = '/messages';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private notificationService: NotificationService
  ) {}

  getMessages(page: number = 0, size: number = 10): Observable<PageResponse<Message>> {
    return this.api.getPagedData<Message>(this.endpoint, page, size);
  }

  getMessageById(id: number): Observable<Message> {
    return this.api.get<Message>(`${this.endpoint}/${id}`);
  }

  getSentMessages(page: number = 0, size: number = 10): Observable<PageResponse<Message>> {
    const userId = this.auth.getCurrentUser()?.id;
    return this.api.get<PageResponse<Message>>(`${this.endpoint}/sent?page=${page}&size=${size}&userId=${userId}`);
  }

  getReceivedMessages(page: number = 0, size: number = 10): Observable<PageResponse<Message>> {
    const userId = this.auth.getCurrentUser()?.id;
    return this.api.get<PageResponse<Message>>(`${this.endpoint}/received?page=${page}&size=${size}&userId=${userId}`);
  }

  getUnreadMessages(page: number = 0, size: number = 10): Observable<PageResponse<Message>> {
    const userId = this.auth.getCurrentUser()?.id;
    return this.api.get<PageResponse<Message>>(`${this.endpoint}/unread?page=${page}&size=${size}&userId=${userId}`);
  }

  sendMessage(message: MessageRequest): Observable<Message> {
    return this.api.post<Message>(this.endpoint, message);
  }

  sendIssueMessage(params: URLSearchParams): Observable<any> {
    return this.api.post<any>('/messages/issue-messages?' + params.toString(), null);
  }

  getMessagesByIssue(issueId: number): Observable<any[]> {
    return this.api.get<any[]>(`/messages/issue/${issueId}`);
  }

  sendIssueMessageWithFile(formData: FormData): Observable<any> {
    return this.api.post<any>('/messages/issue-messages', formData).pipe(
      tap(response => {
        // Notify other participants in the issue chat
        const issueId = formData.get('issueId');
        const senderId = formData.get('senderId');
        const message = formData.get('message') || 'New message in issue chat';
        
        // Backend should handle notifying relevant users
        this.notificationService.sendNotification(
          0, // Backend will determine recipients
          'New Message in Issue',
          `New message in issue #${issueId}: ${message}`,
          'INFO'
        ).subscribe();
      })
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.api.put<void>(`${this.endpoint}/${id}/read`, null);
  }

  deleteMessage(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getUnreadCount(): Observable<number> {
    const userId = this.auth.getCurrentUser()?.id;
    return this.api.get<number>(`${this.endpoint}/unread/count?userId=${userId}`);
  }
}