export interface AssetAllocation {
  id: number;
  assetId: number;
  assetTag: string;
  assetName: string;
  assetCategory: string;
  userId: number;
  userName: string;
  userEmail: string;
  allocatedDate: string;
  returnedDate?: string;
  remarks?: string;
  status: 'ACTIVE' | 'RETURNED';
  daysAllocated: number;
  returnRequestDate?: string;
  returnRequestRemarks?: string;
  returnRequested: boolean;
}

export interface AllocationAnalytics {
  totalAllocations: number;
  activeAllocations: number;
  returnedAllocations: number;
  utilizationRate: number;
}