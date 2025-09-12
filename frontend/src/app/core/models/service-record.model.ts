export interface ServiceRecord {
  id: number;
  asset?: {
    id: number;
    assetTag: string;
    name: string;
    category?: string;
    model?: string;
    serialNumber?: string;
    status?: string;
  };
  serviceType: string;
  serviceDate: string;
  description?: string;
  cost?: number;
  vendor?: {
    id: number;
    name: string;
  };
  performedBy?: string;
  status?: string;
  nextServiceDate?: string;
  notes?: string;
  relatedIssue?: {
    id: number;
    title: string;
  };
}

export interface ServiceRecordRequest {
  assetId: number;
  serviceType: string;
  serviceDate: string;
  serviceDescription: string;
  cost?: number;
  vendorId?: number;
  performedBy?: string;
  nextServiceDate?: string;
  status?: string;
  notes?: string;
}