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

  returnAsset(assetId: number, remarks?: string): Observable<Asset> {
    const query = remarks ? `?remarks=${encodeURIComponent(remarks)}` : '';
    return this.api.post<Asset>(`${this.endpoint}/${assetId}/return${query}`, null);
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
    return this.api.getPagedData<Asset>(`${this.endpoint}/search`, page, size, params);
  }

  getGroupSummary(name: string): Observable<{ [key: string]: any }> {
    return this.api.get<{ [key: string]: any }>(`${this.endpoint}/group/summary`, { name });
  }

  allocateFromGroup(name: string, userId: number, remarks?: string): Observable<Asset> {
    const params: any = { name, userId };
    if (remarks) params.remarks = remarks;
    return this.api.post<Asset>(`${this.endpoint}/group/allocate`, null, params);
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

  exportToCsv(): Observable<Blob> {
    return this.api.getBlob(`${this.endpoint}/export/csv`);
  }

  exportToPdf(): Observable<Blob> {
    return this.api.getBlob(`${this.endpoint}/export/pdf`);
  }
}