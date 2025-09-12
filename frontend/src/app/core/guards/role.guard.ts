import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredRoles = route.data['roles'] as UserRole[];
    
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login']);
    }
    
    const user = this.authService.getCurrentUser();
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    if (user?.role && requiredRoles.includes(user.role)) {
      return true;
    }
    
    return this.router.createUrlTree(['/dashboard']);
  }
}