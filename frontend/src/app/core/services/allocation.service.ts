import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { AssetAllocation, PageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AllocationService {
  private endpoint = '/allocations';

  constructor(
    private api: ApiService,
    private notificationService: NotificationService
  ) {}

  getAllocations(page: number = 0, size: number = 10): Observable<PageResponse<AssetAllocation>> {
    return this.api.getPagedData<AssetAllocation>(this.endpoint, page, size);
  }

  getAllocationById(id: number): Observable<AssetAllocation> {
    return this.api.get<AssetAllocation>(`${this.endpoint}/${id}`);
  }

  getAllocationsByUser(userId: number, page: number = 0, size: number = 10): Observable<PageResponse<AssetAllocation>> {
    return this.api.getPagedData<AssetAllocation>(`${this.endpoint}/user/${userId}`, page, size);
  }

  getAllocationsByAsset(assetId: number): Observable<AssetAllocation[]> {
    return this.api.get<AssetAllocation[]>(`${this.endpoint}/asset/${assetId}/history`);
  }

  getActiveAllocations(page: number = 0, size: number = 10): Observable<PageResponse<AssetAllocation>> {
    return this.api.getPagedData<AssetAllocation>(`${this.endpoint}/active`, page, size);
  }

  getCurrentAllocationByAsset(assetId: number): Observable<AssetAllocation> {
    return this.api.get<AssetAllocation>(`${this.endpoint}/asset/${assetId}/current`);
  }

  getAllocationsWithFilters(page: number = 0, size: number = 10, status?: string, search?: string): Observable<PageResponse<AssetAllocation>> {
    let params = `page=${page}&size=${size}`;
    if (status) params += `&status=${status}`;
    if (search) params += `&search=${search}`;
    return this.api.get<PageResponse<AssetAllocation>>(`${this.endpoint}?${params}`);
  }

  getAnalytics(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/analytics`);
  }

  bulkReturnAssets(assetIds: number[], remarks?: string): Observable<any> {
    const params = remarks ? { remarks } : {};
    return this.api.post<any>('/assets/bulk/return', assetIds, params);
  }

  requestReturn(assetId: number, remarks: string): Observable<AssetAllocation> {
    return this.api.post<AssetAllocation>(`${this.endpoint}/request-return/${assetId}`, null, { remarks }).pipe(
      tap(allocation => {
        // Notify IT/Admin about return request
        this.notificationService.sendNotification(
          0, // Send to all IT/Admin users - backend should handle this
          'Asset Return Requested',
          `Return requested for asset ${allocation.assetName || allocation.assetTag}. Reason: ${remarks}`,
          'INFO'
        ).subscribe();
      })
    );
  }

  returnFromUser(assetId: number, userId: number, remarks?: string): Observable<AssetAllocation> {
    const params: any = { assetId, userId };
    if (remarks) params.remarks = remarks;
    return this.api.post<AssetAllocation>(`${this.endpoint}/return-from-user`, null, params);
  }

  acknowledgeReturnRequest(assetId: number, userId: number): Observable<AssetAllocation> {
    return this.api.post<AssetAllocation>(`${this.endpoint}/acknowledge-return/${assetId}?userId=${userId}`, null).pipe(
      tap(allocation => {
        // Notify user that return request was acknowledged
        this.notificationService.sendNotification(
          allocation.userId || userId,
          'Asset Return Acknowledged',
          `Your return request for ${allocation.assetName || allocation.assetTag} has been acknowledged.`,
          'SUCCESS'
        ).subscribe();
      })
    );
  }

  getUserReturnRequests(userId: number): Observable<AssetAllocation[]> {
    return this.api.get<AssetAllocation[]>(`${this.endpoint}/user/${userId}/return-requests`);
  }

  getPendingReturns(): Observable<AssetAllocation[]> {
    return this.api.get<AssetAllocation[]>(`${this.endpoint}/pending-returns`);
  }

  getUserAllocationHistory(userId: number): Observable<AssetAllocation[]> {
    return this.api.get<AssetAllocation[]>(`${this.endpoint}/user/${userId}/history`);
  }
  
  getAllocatedUserIds(assetId: number): Observable<number[]> {
    return this.api.get<number[]>(`${this.endpoint}/asset/${assetId}/allocated-users`);
  }
}