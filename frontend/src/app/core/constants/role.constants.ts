import { UserRole } from '../models/user.model';

export const ROLES: Record<UserRole, UserRole> = {
  EMPLOYEE: 'EMPLOYEE',
  ADMIN: 'ADMIN',
  IT_SUPPORT: 'IT_SUPPORT'
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.EMPLOYEE]: {
    canViewAssets: true,
    canCreateIssues: true,
    canViewOwnIssues: true,
    canManageAssets: false,
    canManageUsers: false,
    canViewAllIssues: false,
    canManageSystem: false,
    canCreateAssetRequests: true,
    canViewOwnRequests: true,
    canManageRequests: false
  },
  [ROLES.IT_SUPPORT]: {
    canViewAssets: true,
    canCreateIssues: true,
    canViewOwnIssues: true,
    canManageAssets: true,
    canManageUsers: false,
    canViewAllIssues: true,
    canManageSystem: false,
    canResolveIssues: true,
    canCreateAssetRequests: true,
    canViewOwnRequests: true,
    canManageRequests: true,
    canApproveRequests: true,
    canFulfillRequests: true
  },
  [ROLES.ADMIN]: {
    canViewAssets: true,
    canCreateIssues: true,
    canViewOwnIssues: true,
    canManageAssets: true,
    canManageUsers: true,
    canViewAllIssues: true,
    canManageSystem: true,
    canResolveIssues: true,
    canCreateAssetRequests: true,
    canViewOwnRequests: true,
    canManageRequests: true,
    canApproveRequests: true,
    canFulfillRequests: true
  }
} as const;

export const ROLE_LABELS = {
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.IT_SUPPORT]: 'IT Support',
  [ROLES.ADMIN]: 'Administrator'
} as const;