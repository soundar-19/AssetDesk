export interface AssetRequest {
  id: number;
  requestType: 'NEW_ASSET' | 'REPLACEMENT' | 'UPGRADE' | 'ADDITIONAL';
  category: string;
  assetType: string;
  assetName: string;
  preferredModel?: string;
  estimatedCost?: number;
  businessJustification: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  requiredDate?: string;
  specifications?: string;
  additionalNotes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED';
  requestedBy?: {
    id: number;
    name: string;
    email: string;
    department?: string;
  };
  requestedDate: string;
  approvedBy?: {
    id: number;
    name: string;
  };
  approvedDate?: string;
  rejectedBy?: {
    id: number;
    name: string;
  };
  rejectedDate?: string;
  rejectionReason?: string;
  fulfilledBy?: {
    id: number;
    name: string;
  };
  fulfilledDate?: string;
  allocatedAsset?: {
    id: number;
    assetTag: string;
    name: string;
  };
  remarks?: string;
}

export interface AssetRequestCreate {
  requestType: 'NEW_ASSET' | 'REPLACEMENT' | 'UPGRADE' | 'ADDITIONAL';
  category: string;
  assetType: string;
  assetName: string;
  preferredModel?: string;
  estimatedCost?: number;
  businessJustification: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  requiredDate?: string;
  specifications?: string;
  additionalNotes?: string;
  requestedBy: number;
}