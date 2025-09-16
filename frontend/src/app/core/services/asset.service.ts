import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Asset, AssetCreateRequest, PageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private endpoint = '/assets';

  constructor(private api: ApiService) {}

  getAssets(page: number = 0, size: number = 10, sortBy?: string, sortDir?: string): Observable<PageResponse<Asset>> {
    const params: any = {};
    if (sortBy) params.sortBy = sortBy;
    if (sortDir) params.sortDir = sortDir;
    return this.api.getPagedData<Asset>(this.endpoint, page, size, params);
  }

  getAllAssets(page: number = 0, size: number = 10, sortBy?: string, sortDir?: string): Observable<PageResponse<Asset>> {
    const params: any = {};
    if (sortBy) params.sortBy = sortBy;
    if (sortDir) params.sortDir = sortDir;
    return this.api.getPagedData<Asset>(this.endpoint, page, size, params);
  }

  getAssetById(id: number): Observable<Asset> {
    return this.api.get<Asset>(`${this.endpoint}/${id}`);
  }

  getAssetByTag(tag: string): Observable<Asset> {
    return this.api.get<Asset>(`${this.endpoint}/tag/${tag}`);
  }

  getAssetsByCategory(category: string, page: number = 0, size: number = 10): Observable<PageResponse<Asset>> {
    return this.api.getPagedData<Asset>(`${this.endpoint}/category/${category}`, page, size);
  }

  getAssetsByStatus(status: string, page: number = 0, size: number = 10): Observable<PageResponse<Asset>> {
    return this.api.getPagedData<Asset>(`${this.endpoint}/status/${status}`, page, size);
  }

  getAvailableAssets(page: number = 0, size: number = 10): Observable<PageResponse<Asset>> {
    return this.api.getPagedData<Asset>(`${this.endpoint}/available`, page, size);
  }

  getAssetsByUser(userId: number, page: number = 0, size: number = 10): Observable<PageResponse<Asset>> {
    return this.api.getPagedData<Asset>(`${this.endpoint}/user/${userId}`, page, size);
  }

  createAsset(asset: AssetCreateRequest): Observable<Asset> {
    return this.api.post<Asset>(this.endpoint, asset);
  }

  updateAsset(id: number, asset: AssetCreateRequest): Observable<Asset> {
    return this.api.put<Asset>(`${this.endpoint}/${id}`, asset);
  }

  deleteAsset(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  allocateAsset(assetId: number, userId: number, remarks?: string): Observable<Asset> {
    const query = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<Asset>(`${this.endpoint}/${assetId}/allocate/${userId}${query}`, null);
  }

  allocateAssetByEmployeeId(assetId: number, employeeId: string, remarks?: string): Observable<Asset> {
    const query = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<Asset>(`${this.endpoint}/${assetId}/allocate-by-employee/${employeeId}${query}`, null);
  }

  returnAsset(assetId: number, remarks?: string): Observable<Asset> {
    const query = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<Asset>(`${this.endpoint}/${assetId}/return${query}`, null);
  }

  returnAssetFromUser(assetId: number, userId: number, remarks?: string): Observable<any> {
    const params: any = { assetId, userId };
    if (remarks) params.remarks = remarks;
    return this.api.post<any>('/allocations/return-from-user', null, params);
  }

  requestAssetReturn(assetId: number, remarks?: string): Observable<any> {
    const params = remarks ? { remarks } : {};
    return this.api.post<any>(`/allocations/request-return/${assetId}`, null, params);
  }

  acknowledgeReturnRequest(assetId: number, userId: number): Observable<any> {
    return this.api.post<any>(`/allocations/acknowledge-return/${assetId}`, null, { userId });
  }

  getUserReturnRequests(userId: number): Observable<any[]> {
    return this.api.get<any[]>(`/allocations/user/${userId}/return-requests`);
  }

  getPendingReturns(): Observable<any[]> {
    return this.api.get<any[]>('/allocations/pending-returns');
  }

  getAssetGroups(): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/groups`);
  }

  getAssetsByName(name: string, page: number = 0, size: number = 10): Observable<PageResponse<Asset>> {
    return this.api.getPagedData<Asset>(`${this.endpoint}/by-name/${encodeURIComponent(name)}`, page, size);
  }

  getDepreciation(assetId: number, asOfDate?: string): Observable<{ [key: string]: any }> {
    const query = asOfDate ? `?asOfDate=${encodeURIComponent(asOfDate)}` : '';
    return this.api.get<{ [key: string]: any }>(`${this.endpoint}/${assetId}/depreciation${query}`);
  }

  getWarrantyExpiring(days: number = 30, page: number = 0, size: number = 10): Observable<PageResponse<Asset>> {
    return this.api.getPagedData<Asset>(`${this.endpoint}/warranty/expiring?days=${days}`, page, size);
  }

  searchAssets(params: { 
    name?: string; 
    category?: string; 
    type?: string; 
    status?: string;
    assetTag?: string;
    model?: string;
    serialNumber?: string;
    vendor?: string;
    sortBy?: string;
    sortDir?: string;
  }, page: number = 0, size: number = 10): Observable<PageResponse<Asset>> {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());
    
    Object.keys(params).forEach(key => {
      const value = params[key as keyof typeof params];
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.api.get<PageResponse<Asset>>(`${this.endpoint}/search?${searchParams.toString()}`);
  }

  getGroupSummary(name: string): Observable<{ [key: string]: any }> {
    return this.api.get<{ [key: string]: any }>(`${this.endpoint}/group/summary`, { name });
  }

  allocateFromGroup(name: string, userId: number, remarks?: string): Observable<Asset> {
    const params: any = { name, userId };
    if (remarks) params.remarks = remarks;
    return this.api.post<Asset>(`${this.endpoint}/group/allocate`, null, params);
  }

  allocateFromGroupByEmployeeId(name: string, employeeId: string, remarks?: string): Observable<Asset> {
    const params: any = { name, employeeId };
    if (remarks) params.remarks = remarks;
    return this.api.post<Asset>(`${this.endpoint}/group/allocate-by-employee`, null, params);
  }

  getWarrantyStats(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/warranty/stats`);
  }

  getExpiredWarranties(page: number = 0, size: number = 10): Observable<PageResponse<Asset>> {
    return this.api.getPagedData<Asset>(`${this.endpoint}/warranty/expired`, page, size);
  }

  getValidWarranties(page: number = 0, size: number = 10): Observable<PageResponse<Asset>> {
    return this.api.getPagedData<Asset>(`${this.endpoint}/warranty/valid`, page, size);
  }

  exportToCsv(filters?: any): Observable<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}/export/csv?${queryString}` : `${this.endpoint}/export/csv`;
    return this.api.getBlob(url);
  }

  exportToPdf(filters?: any): Observable<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}/export/pdf?${queryString}` : `${this.endpoint}/export/pdf`;
    return this.api.getBlob(url);
  }

  getAllocationAnalytics(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/allocations/analytics`);
  }

  bulkReturnAssets(assetIds: number[], remarks?: string): Observable<any> {
    const body = assetIds;
    const params = remarks ? { remarks } : {};
    return this.api.post<any>(`${this.endpoint}/bulk/return`, body, params);
  }

  getFilteredCount(filters?: any): Observable<number> {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}/count?${queryString}` : `${this.endpoint}/count`;
    return this.api.get<number>(url);
  }
}