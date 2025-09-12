export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ISSUE_ASSIGNED' | 'ISSUE_UPDATED' | 'ISSUE_RESOLVED' | 'NEW_MESSAGE' | 'ASSET_ALLOCATED' | 'ASSET_RETURNED' | 'MAINTENANCE_DUE' | 'WARRANTY_EXPIRING' | 'SYSTEM_ALERT';

export interface Notification {
  id: number;
  userId?: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedIssueId?: number;
  relatedAssetId?: number;
}

export interface PaginationInfo {
  page: number;
  totalPages: number;
  totalElements: number;
}