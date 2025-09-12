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

  getVendors(page: number = 0, size: number = 10): Observable<PageResponse<Vendor>> {
    return this.api.getPagedData<Vendor>(this.endpoint, page, size);
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
}