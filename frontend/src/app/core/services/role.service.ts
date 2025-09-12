import { Injectable } from '@angular/core';
import { UserRole } from '../models/user.model';
import { ROLES, ROLE_PERMISSIONS, ROLE_LABELS } from '../constants/role.constants';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private authService: AuthService) {}

  hasRole(role: UserRole): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role ? roles.includes(currentUser.role) : false;
  }

  canViewAssets(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role ? ROLE_PERMISSIONS[currentUser.role].canViewAssets : false;
  }

  canManageAssets(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role ? ROLE_PERMISSIONS[currentUser.role].canManageAssets : false;
  }

  canManageUsers(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role ? ROLE_PERMISSIONS[currentUser.role].canManageUsers : false;
  }

  canViewAllIssues(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role ? ROLE_PERMISSIONS[currentUser.role].canViewAllIssues : false;
  }

  canResolveIssues(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role ? ROLE_PERMISSIONS[currentUser.role].canResolveIssues || false : false;
  }

  canManageSystem(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role ? ROLE_PERMISSIONS[currentUser.role].canManageSystem : false;
  }

  getRoleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  }

  getCurrentUserRole(): UserRole | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role || null;
  }

  isEmployee(): boolean {
    return this.hasRole(ROLES.EMPLOYEE);
  }

  isITSupport(): boolean {
    return this.hasRole(ROLES.IT_SUPPORT);
  }

  isAdmin(): boolean {
    return this.hasRole(ROLES.ADMIN);
  }

  canViewDashboard(): boolean {
    return true; // All roles can view dashboard
  }

  canViewAllocations(): boolean {
    return true; // All roles can view allocations (filtered by backend)
  }

  canViewVendors(): boolean {
    return this.canManageAssets();
  }

  canViewServiceRecords(): boolean {
    return this.canManageAssets();
  }

  canViewProfile(): boolean {
    return true; // All roles can view their profile
  }

  canViewNotifications(): boolean {
    return true; // All roles can view notifications
  }

  canViewMyIssues(): boolean {
    return true; // All roles can view their own issues
  }

  canCreateAssets(): boolean {
    return this.canManageAssets();
  }

  canEditAssets(): boolean {
    return this.canManageAssets();
  }

  canDeleteAssets(): boolean {
    return this.hasRole(ROLES.ADMIN); // Only admin can delete assets
  }

  canAllocateAssets(): boolean {
    return this.canManageAssets();
  }

  canViewReports(): boolean {
    return this.canManageSystem();
  }

  canAssignIssues(): boolean {
    return this.canResolveIssues();
  }

  canViewUserAssets(): boolean {
    return this.canManageAssets();
  }

  canManageVendors(): boolean {
    return this.canManageAssets();
  }

  canManageServiceRecords(): boolean {
    return this.canManageAssets();
  }
}