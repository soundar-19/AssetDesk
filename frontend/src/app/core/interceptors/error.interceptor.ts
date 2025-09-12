import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log error details for debugging
      console.error('HTTP Error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error
      });
      
      if (error.status === 401) {
        // Only logout if it's not a login attempt
        if (!error.url?.includes('/auth/login')) {
          authService.logout();
          toastService.error('Session expired. Please login again.');
        }
      } else if (error.status === 403) {
        const currentUser = authService.getCurrentUser();
        console.error('403 Forbidden - User role:', currentUser?.role, 'URL:', error.url);
        toastService.error(`Access denied. Role: ${currentUser?.role}. Check backend permissions.`);
      } else if (error.status === 404) {
        toastService.error('Resource not found.');
      } else if (error.status >= 500) {
        toastService.error('Server error. Please try again later.');
      } else if (error.status === 0) {
        toastService.error('Network error. Please check your connection.');
      } else if (error.status === 400 && error.url?.includes('/auth/login')) {
        toastService.error('Invalid email or password.');
      } else {
        const message = error.error?.message || error.message || 'An error occurred';
        toastService.error(message);
      }
      
      return throwError(() => error);
    })
  );
};