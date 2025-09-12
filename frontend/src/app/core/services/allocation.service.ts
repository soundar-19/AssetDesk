import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AssetAllocation, PageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AllocationService {
  private endpoint = '/allocations';

  constructor(private api: ApiService) {}

  getAllocations(page: number = 0, size: number = 10): Observable<PageResponse<AssetAllocation>> {
    return this.api.getPagedData<AssetAllocation>(this.endpoint, page, size);
  }

  getAllocationById(id: number): Observable<AssetAllocation> {
    return this.api.get<AssetAllocation>(`${this.endpoint}/${id}`);
  }

  getAllocationsByUser(userId: number, page: number = 0, size: number = 10): Observable<PageResponse<AssetAllocation>> {
    return this.api.getPagedData<AssetAllocation>(`${this.endpoint}/user/${userId}`, page, size);
  }

  getAllocationsByAsset(assetId: number, page: number = 0, size: number = 10): Observable<PageResponse<AssetAllocation>> {
    return this.api.getPagedData<AssetAllocation>(`${this.endpoint}/asset/${assetId}`, page, size);
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
}