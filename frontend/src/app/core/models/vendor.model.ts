export interface Vendor {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;
  website?: string;
  status: string;
}

export interface VendorRequest {
  name: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;
  website?: string;
  status: string;
}