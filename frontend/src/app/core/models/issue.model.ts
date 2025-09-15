export interface Issue {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  reportedByName: string;
  reportedById: number;
  assignedToName?: string;
  assignedToId?: number;
  assetTag: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  resolutionCost?: number;
  replacementOffered?: boolean;
}

export interface IssueRequest {
  title: string;
  description: string;
  type: string;
  priority: string;
  assetId: number;
}