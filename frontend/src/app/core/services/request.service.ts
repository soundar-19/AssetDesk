import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AssetRequestCreate, AssetRequestResponse, PageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private endpoint = '/asset-requests';

  constructor(private api: ApiService) {}

  create(requesterId: number, payload: AssetRequestCreate): Observable<AssetRequestResponse> {
    const requestData = {
      requestType: payload.requestType,
      requestedCategory: payload.requestedCategory,
      requestedType: payload.requestedType,
      requestedModel: payload.requestedModel,
      justification: payload.justification,
      requesterId: requesterId
    };
    return this.api.post<AssetRequestResponse>(this.endpoint, requestData);
  }

  list(page: number = 0, size: number = 10): Observable<PageResponse<AssetRequestResponse>> {
    return this.api.getPagedData<AssetRequestResponse>(`${this.endpoint}`, page, size);
  }

  myRequests(requesterId: number, page: number = 0, size: number = 10): Observable<PageResponse<AssetRequestResponse>> {
    return this.api.getPagedData<AssetRequestResponse>(`${this.endpoint}/user/${requesterId}`, page, size);
  }

  approve(id: number, approverId: number, remarks?: string): Observable<AssetRequestResponse> {
    const params = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<AssetRequestResponse>(`${this.endpoint}/${id}/approve/${approverId}${params}`, null);
  }

  reject(id: number, approverId: number, remarks?: string): Observable<AssetRequestResponse> {
    const params = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<AssetRequestResponse>(`${this.endpoint}/${id}/reject/${approverId}${params}`, null);
  }

  allocateAsset(requestId: number, assetId: number, approverId: number, remarks?: string): Observable<AssetRequestResponse> {
    const params = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<AssetRequestResponse>(`${this.endpoint}/${requestId}/allocate/${assetId}/${approverId}${params}`, null);
  }
}


