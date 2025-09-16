import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { ROLES } from './core/constants/role.constants';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayoutComponent,
    children: [
      { path: '', component: LoginComponent }
    ]
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'assets',
        loadComponent: () => import('./features/assets/assets-router.component').then(m => m.AssetsRouterComponent)
      },
      {
        path: 'requests',
        loadComponent: () => import('./features/assets/asset-requests-list.component').then(m => m.AssetRequestsListComponent)
      },
      {
        path: 'requests/new',
        loadComponent: () => import('./features/assets/asset-request-form.component').then(m => m.AssetRequestFormComponent)
      },
      {
        path: 'requests/:id',
        loadComponent: () => import('./features/assets/asset-request-detail.component').then(m => m.AssetRequestDetailComponent)
      },
      {
        path: 'requests/:id/edit',
        loadComponent: () => import('./features/assets/asset-request-form.component').then(m => m.AssetRequestFormComponent)
      },
      {
        path: 'assets/new',
        loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },
      {
        path: 'assets/:id',
        loadComponent: () => import('./features/assets/asset-detail/asset-detail.component').then(m => m.AssetDetailComponent)
      },
      {
        path: 'assets/:id/edit',
        loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },
      {
        path: 'assets/:id/allocations',
        loadComponent: () => import('./features/assets/asset-allocation-history.component').then(m => m.AssetAllocationHistoryComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },
      {
        path: 'assets/:id/issue',
        loadComponent: () => import('./features/issues/issue-form/issue-form.component').then(m => m.IssueFormComponent)
      },
      {
        path: 'warranty',
        loadComponent: () => import('./features/assets/warranty-management.component').then(m => m.WarrantyManagementComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },
      {
        path: 'assets/group/:name',
        loadComponent: () => import('./features/assets/assets-by-group.component').then(m => m.AssetsByGroupComponent)
      },
      {
        path: 'assets/allocate',
        loadComponent: () => import('./features/assets/asset-allocation.component').then(m => m.AssetAllocationComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },

      {
        path: 'issues',
        loadComponent: () => import('./features/issues/issues-router.component').then(m => m.IssuesRouterComponent)
      },
      {
        path: 'issues/new',
        loadComponent: () => import('./features/issues/issue-form/issue-form.component').then(m => m.IssueFormComponent)
      },
      {
        path: 'issues/:id',
        loadComponent: () => import('./features/issues/issue-detail/issue-detail.component').then(m => m.IssueDetailComponent)
      },
      {
        path: 'issues/:id/edit',
        loadComponent: () => import('./features/issues/issue-form/issue-form.component').then(m => m.IssueFormComponent)
      },

      {
        path: 'issues/:id/chat',
        loadComponent: () => import('./features/issues/issue-chat/issue-chat.component').then(m => m.IssueChatComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users-list.component').then(m => m.UsersListComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN] }
      },
      {
        path: 'users/new',
        loadComponent: () => import('./features/users/user-form.component').then(m => m.UserFormComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN] }
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/users/user-detail.component').then(m => m.UserDetailComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN] }
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./features/users/user-form.component').then(m => m.UserFormComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN] }
      },
      {
        path: 'users/:id/assets',
        loadComponent: () => import('./features/users/user-assets-page.component').then(m => m.UserAssetsPageComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN] }
      },
      {
        path: 'users/:id/allocations',
        loadComponent: () => import('./features/users/user-allocation-history.component').then(m => m.UserAllocationHistoryComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN] }
      },

      {
        path: 'vendors',
        loadComponent: () => import('./features/vendors/vendors-list.component').then(m => m.VendorsListComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },
      {
        path: 'vendors/new',
        loadComponent: () => import('./features/vendors/vendor-form.component').then(m => m.VendorFormComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },
      {
        path: 'vendors/:id',
        loadComponent: () => import('./features/vendors/vendor-detail.component').then(m => m.VendorDetailComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },
      {
        path: 'vendors/:id/edit',
        loadComponent: () => import('./features/vendors/vendor-form.component').then(m => m.VendorFormComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },

      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications-list.component').then(m => m.NotificationsListComponent)
      },
      {
        path: 'return-requests',
        loadComponent: () => import('./features/assets/user-return-requests.component').then(m => m.UserReturnRequestsComponent)
      },
      {
        path: 'admin/return-requests',
        loadComponent: () => import('./features/assets/admin-return-requests.component').then(m => m.AdminReturnRequestsComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },


      {
        path: 'service-records',
        loadComponent: () => import('./features/service-records/service-records-list.component').then(m => m.ServiceRecordsListComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },
      {
        path: 'service-records/new',
        loadComponent: () => import('./features/service-records/service-record-form.component').then(m => m.ServiceRecordFormComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },
      {
        path: 'service-records/:id',
        loadComponent: () => import('./features/service-records/service-record-detail.component').then(m => m.ServiceRecordDetailComponent)
      },
      {
        path: 'service-records/:id/edit',
        loadComponent: () => import('./features/service-records/service-record-form.component').then(m => m.ServiceRecordFormComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'profile/change-password',
        loadComponent: () => import('./features/profile/change-password.component').then(m => m.ChangePasswordComponent)
      },

      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.IT_SUPPORT] }
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];