import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { AssetRequest, PageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private endpoint = '/asset-requests';

  constructor(
    private api: ApiService,
    private notificationService: NotificationService
  ) {}

  createAssetRequest(requestData: any): Observable<AssetRequest> {
    return this.api.post<AssetRequest>(this.endpoint, requestData);
  }

  getAllRequests(page: number = 0, size: number = 10): Observable<PageResponse<AssetRequest>> {
    return this.api.getPagedData<AssetRequest>(this.endpoint, page, size);
  }

  getRequestsByUser(userId: number, page: number = 0, size: number = 10): Observable<PageResponse<AssetRequest>> {
    return this.api.getPagedData<AssetRequest>(`${this.endpoint}/user/${userId}`, page, size);
  }

  getRequestById(id: number): Observable<AssetRequest> {
    return this.api.get<AssetRequest>(`${this.endpoint}/${id}`);
  }

  updateRequest(id: number, requestData: any): Observable<AssetRequest> {
    return this.api.put<AssetRequest>(`${this.endpoint}/${id}`, requestData);
  }

  updateRequestStatus(id: number, status: string, remarks?: string): Observable<AssetRequest> {
    const params = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.put<AssetRequest>(`${this.endpoint}/${id}/status/${status}${params}`, null);
  }

  approveRequest(id: number, approverId: number, remarks?: string): Observable<AssetRequest> {
    const params = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<AssetRequest>(`${this.endpoint}/${id}/approve/${approverId}${params}`, null).pipe(
      tap(request => {
        this.notificationService.sendNotification(
          request.requestedBy?.id || 0,
          'Asset Request Approved',
          `Your request for ${request.assetName} has been approved.`,
          'SUCCESS'
        ).subscribe();
      })
    );
  }

  rejectRequest(id: number, approverId: number, remarks?: string): Observable<AssetRequest> {
    const params = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<AssetRequest>(`${this.endpoint}/${id}/reject/${approverId}${params}`, null).pipe(
      tap(request => {
        this.notificationService.sendNotification(
          request.requestedBy?.id || 0,
          'Asset Request Rejected',
          `Your request for ${request.assetName} has been rejected. ${remarks ? 'Reason: ' + remarks : ''}`,
          'ERROR'
        ).subscribe();
      })
    );
  }

  fulfillRequest(requestId: number, assetId: number, approverId: number, remarks?: string): Observable<AssetRequest> {
    const params = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<AssetRequest>(`${this.endpoint}/${requestId}/fulfill/${assetId}/${approverId}${params}`, null).pipe(
      tap(request => {
        this.notificationService.sendNotification(
          request.requestedBy?.id || 0,
          'Asset Request Fulfilled',
          `Your request for ${request.assetName} has been fulfilled and the asset has been allocated to you.`,
          'SUCCESS'
        ).subscribe();
      })
    );
  }

  deleteRequest(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}