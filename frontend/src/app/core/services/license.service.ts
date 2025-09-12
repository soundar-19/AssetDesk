import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface SoftwareLicense {
  id?: number;
  name: string;
  vendor?: string;
  licenseKey?: string;
  licenseType?: 'PER_USER' | 'PER_DEVICE';
  seatsTotal?: number;
  seatsAllocated?: number;
  expiryDate?: string;
  status?: 'ACTIVE' | 'EXPIRED';
  notes?: string;
}

export interface SoftwareAllocation {
  id?: number;
  licenseId: number;
  userId: number;
  allocatedDate?: string;
  revokedDate?: string;
  remarks?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class LicenseService {
  private licenseEndpoint = '/licenses';
  private allocationEndpoint = '/license-allocations';

  constructor(private api: ApiService) {}

  listLicenses(name?: string, page: number = 0, size: number = 10): Observable<PageResponse<SoftwareLicense>> {
    const params: any = {};
    if (name) params.name = name;
    return this.api.getPagedData<SoftwareLicense>(this.licenseEndpoint, page, size, params);
  }

  createLicense(license: SoftwareLicense): Observable<SoftwareLicense> {
    return this.api.post<SoftwareLicense>(this.licenseEndpoint, license);
  }

  allocate(licenseId: number, userId: number, date?: string, remarks?: string): Observable<any> {
    const parts: string[] = [`licenseId=${encodeURIComponent(String(licenseId))}`, `userId=${encodeURIComponent(String(userId))}`];
    if (date) parts.push(`date=${encodeURIComponent(date)}`);
    if (remarks) parts.push(`remarks=${encodeURIComponent(remarks)}`);
    const qs = `?${parts.join('&')}`;
    return this.api.post<any>(`${this.allocationEndpoint}/allocate${qs}`, null as any);
  }

  revoke(allocationId: number, date?: string, remarks?: string): Observable<any> {
    const suffix: string[] = [];
    if (date) suffix.push(`date=${encodeURIComponent(date)}`);
    if (remarks) suffix.push(`remarks=${encodeURIComponent(remarks)}`);
    const qs = suffix.length ? `?${suffix.join('&')}` : '';
    return this.api.post<any>(`${this.allocationEndpoint}/${allocationId}/revoke${qs}`, null as any);
  }

  listByUser(userId: number, page: number = 0, size: number = 10): Observable<PageResponse<any>> {
    return this.api.getPagedData<any>(`${this.allocationEndpoint}/user/${userId}`, page, size);
  }

  listByLicense(licenseId: number, page: number = 0, size: number = 10): Observable<PageResponse<any>> {
    return this.api.getPagedData<any>(`${this.allocationEndpoint}/license/${licenseId}`, page, size);
  }
}



