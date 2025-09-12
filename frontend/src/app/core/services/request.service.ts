import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AssetRequest, PageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private endpoint = '/asset-requests';

  constructor(private api: ApiService) {}

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
    return this.api.post<AssetRequest>(`${this.endpoint}/${id}/approve/${approverId}${params}`, null);
  }

  rejectRequest(id: number, approverId: number, remarks?: string): Observable<AssetRequest> {
    const params = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<AssetRequest>(`${this.endpoint}/${id}/reject/${approverId}${params}`, null);
  }

  fulfillRequest(requestId: number, assetId: number, approverId: number, remarks?: string): Observable<AssetRequest> {
    const params = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<AssetRequest>(`${this.endpoint}/${requestId}/fulfill/${assetId}/${approverId}${params}`, null);
  }

  deleteRequest(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}