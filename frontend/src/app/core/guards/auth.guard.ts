import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    const isAuth = this.authService.isAuthenticated();
    console.log('Auth Guard check:', isAuth);
    
    if (isAuth) {
      return of(true);
    }
    
    console.log('Auth Guard: Redirecting to login');
    return of(this.router.createUrlTree(['/login']));
  }
}