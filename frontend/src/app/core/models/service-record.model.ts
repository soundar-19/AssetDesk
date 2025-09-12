export interface ServiceRecord {
  id: number;
  asset: any;
  serviceType: string;
  serviceDate: string;
  description?: string;
  cost: number;
  vendor?: any;
  performedBy?: string;
  status: string;
  nextServiceDate?: string;
  notes?: string;
}

export interface ServiceRecordRequest {
  assetId: number;
  serviceType: string;
  serviceDate: string;
  description?: string;
  cost: number;
  vendorId?: number;
  performedBy?: string;
  nextServiceDate?: string;
  notes?: string;
}