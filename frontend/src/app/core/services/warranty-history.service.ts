import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface WarrantyHistoryItem {
  id: number;
  oldExpiryDate?: string;
  newExpiryDate?: string;
  changedAt: string;
  reason?: string;
}

@Injectable({ providedIn: 'root' })
export class WarrantyHistoryService {
  private endpoint = '/warranty-history';
  constructor(private api: ApiService) {}
  listByAsset(assetId: number): Observable<WarrantyHistoryItem[]> {
    return this.api.get<WarrantyHistoryItem[]>(`${this.endpoint}/asset/${assetId}`);
  }
}


