export interface AssetRequestCreate {
  requestType: 'NEW' | 'REPLACEMENT';
  requestedCategory?: string;
  requestedType?: string;
  requestedModel?: string;
  justification?: string;
  requesterId?: number;
}

export interface AssetRequestResponse {
  id: number;
  requesterId: number;
  requesterName?: string;
  requestType: 'NEW' | 'REPLACEMENT';
  requestedCategory?: string;
  requestedType?: string;
  requestedModel?: string;
  justification?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  decisionById?: number;
  decisionByName?: string;
  decisionAt?: string;
  decisionRemarks?: string;
}


