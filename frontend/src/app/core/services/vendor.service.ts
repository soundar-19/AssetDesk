import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Vendor, VendorRequest, PageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private endpoint = '/vendors';

  constructor(private api: ApiService) {}

  getVendors(page: number = 0, size: number = 10, sortBy?: string, sortDir?: string): Observable<PageResponse<Vendor>> {
    const params: any = {};
    if (sortBy) params.sortBy = sortBy;
    if (sortDir) params.sortDir = sortDir;
    return this.api.getPagedData<Vendor>(this.endpoint, page, size, params);
  }

  getVendorById(id: number): Observable<Vendor> {
    return this.api.get<Vendor>(`${this.endpoint}/${id}`);
  }

  getActiveVendors(page: number = 0, size: number = 10): Observable<PageResponse<Vendor>> {
    return this.api.getPagedData<Vendor>(`${this.endpoint}/active`, page, size);
  }

  createVendor(vendor: VendorRequest): Observable<Vendor> {
    return this.api.post<Vendor>(this.endpoint, vendor);
  }

  updateVendor(id: number, vendor: VendorRequest): Observable<Vendor> {
    return this.api.put<Vendor>(`${this.endpoint}/${id}`, vendor);
  }

  deleteVendor(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  searchVendors(params: {
    name?: string;
    email?: string;
    phone?: string;
    status?: string;
    contactPerson?: string;
    sortBy?: string;
    sortDir?: string;
  }, page: number = 0, size: number = 10): Observable<PageResponse<Vendor>> {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());
    
    Object.keys(params).forEach(key => {
      const value = params[key as keyof typeof params];
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.api.get<PageResponse<Vendor>>(`${this.endpoint}/search?${searchParams.toString()}`);
  }

  getAllVendorsList(): Observable<Vendor[]> {
    return this.api.get<Vendor[]>(`${this.endpoint}/all`);
  }

  searchVendorsByName(name: string): Observable<Vendor[]> {
    return this.api.get<Vendor[]>(`${this.endpoint}/search/name`, { name });
  }
}