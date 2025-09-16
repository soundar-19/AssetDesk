export interface Asset {
  id: number;
  assetTag: string;
  name: string;
  category: string;
  type: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiryDate: string;
  cost: number;
  usefulLifeYears?: number;
  status: string;
  imageUrl?: string;
  isShareable?: boolean;
  vendor?: any;
  allocatedTo?: { id: number; name: string; email: string };
  allocatedDate?: string;
  allocationDurationDays?: number;
  // Software license specific fields
  totalLicenses?: number;
  usedLicenses?: number;
  licenseExpiryDate?: string;
  licenseKey?: string;
  version?: string;
}

export interface AssetCreateRequest {
  assetTag: string;
  name: string;
  category: string;
  type: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiryDate: string;
  cost: number;
  usefulLifeYears?: number;
  status: string;
  imageUrl?: string;
  isShareable?: boolean;
  vendorId?: number;
  // Software license specific fields
  totalLicenses?: number;
  usedLicenses?: number;
  licenseExpiryDate?: string;
  licenseKey?: string;
  version?: string;
}