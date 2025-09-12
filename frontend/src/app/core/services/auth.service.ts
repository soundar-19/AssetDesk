import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, AuthResponse, User, UserRole } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuth(response);
        })
      );
  }

  logout(): void {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.router.navigate(['/login']).catch(err => 
      console.error('Navigation error:', err)
    );
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    console.log('Auth check:', { hasToken: !!token, hasUser: !!user });
    return !!token && !!user;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  updateCurrentUser(user: User): void {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }

  private setAuth(authResponse: AuthResponse): void {
    try {
      localStorage.setItem('token', authResponse.token);
      
      const emailParts = authResponse.email?.includes('@') ? 
        authResponse.email.split('@') : ['user', 'domain.com'];
      
      const user: User = {
        id: authResponse.userId,
        employeeId: emailParts[0],
        email: authResponse.email,
        name: emailParts[0],
        role: authResponse.role,
        department: '',
        designation: '',
        status: 'ACTIVE',
        dateJoined: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      this.tokenSubject.next(authResponse.token);
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  }

  private loadStoredAuth(): void {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        this.tokenSubject.next(token);
        this.currentUserSubject.next(user);
      } else if (token || userStr) {
        // Clear partial auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}