import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // Check if URL path starts with /auth/ to exclude auth endpoints
  const url = new URL(req.url, window.location.origin);
  const isAuthEndpoint = url.pathname.startsWith('/api/auth/');
  
  console.log('JWT Interceptor:', { url: req.url, hasToken: !!token, isAuthEndpoint });
  
  if (token && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};