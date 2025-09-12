import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { ServiceRecord, ServiceRecordRequest, PageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ServiceRecordService {
  private endpoint = '/service-records';

  constructor(private api: ApiService) {}

  getServiceRecords(page: number = 0, size: number = 10): Observable<PageResponse<ServiceRecord>> {
    if (page < 0) {
      return throwError(() => new Error('Page number must be non-negative'));
    }
    if (size <= 0) {
      return throwError(() => new Error('Page size must be positive'));
    }
    return this.api.getPagedData<ServiceRecord>(this.endpoint, page, size);
  }

  getServiceRecordById(id: number): Observable<ServiceRecord> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Valid service record ID is required'));
    }
    return this.api.get<ServiceRecord>(`${this.endpoint}/${id}`);
  }

  getServiceRecordsByAsset(assetId: number): Observable<ServiceRecord[]> {
    if (!assetId || assetId <= 0) {
      return throwError(() => new Error('Valid asset ID is required'));
    }
    return this.api.get<ServiceRecord[]>(`${this.endpoint}/asset/${assetId}`);
  }

  createServiceRecord(record: ServiceRecordRequest): Observable<ServiceRecord> {
    return this.api.post<ServiceRecord>(this.endpoint, record);
  }

  updateServiceRecord(id: number, record: ServiceRecordRequest): Observable<ServiceRecord> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Valid service record ID is required'));
    }
    return this.api.put<ServiceRecord>(`${this.endpoint}/${id}`, record);
  }

  deleteServiceRecord(id: number): Observable<void> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Valid service record ID is required'));
    }
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}