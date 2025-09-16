import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserRequest, PageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private endpoint = '/users';

  constructor(private api: ApiService) {}

  getUsers(page: number = 0, size: number = 50, sortBy?: string, sortDir?: string): Observable<PageResponse<User>> {
    const params: any = {};
    if (sortBy) params.sortBy = sortBy;
    if (sortDir) params.sortDir = sortDir;
    return this.api.getPagedData<User>(this.endpoint, page, size, params);
  }

  searchUsers(params: {
    name?: string;
    email?: string;
    employeeId?: string;
    department?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortDir?: string;
  }, page: number = 0, size: number = 50): Observable<PageResponse<User>> {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());
    
    Object.keys(params).forEach(key => {
      const value = params[key as keyof typeof params];
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.api.get<PageResponse<User>>(`${this.endpoint}/search?${searchParams.toString()}`);
  }

  getUserById(id: number): Observable<User> {
    return this.api.get<User>(`${this.endpoint}/${id}`);
  }

  getUserByEmployeeId(employeeId: string): Observable<User> {
    if (!employeeId?.trim()) {
      return throwError(() => new Error('Employee ID is required'));
    }
    return this.api.get<User>(`${this.endpoint}/employee/${employeeId.trim()}`);
  }

  getUserByEmail(email: string): Observable<User> {
    if (!email?.trim() || !email.includes('@')) {
      return throwError(() => new Error('Valid email is required'));
    }
    return this.api.get<User>(`${this.endpoint}/email/${email.trim()}`);
  }

  getUsersByRole(role: string, page: number = 0, size: number = 50): Observable<PageResponse<User>> {
    return this.api.getPagedData<User>(`${this.endpoint}/role/${role}`, page, size);
  }

  getUsersByDepartment(department: string, page: number = 0, size: number = 50): Observable<PageResponse<User>> {
    return this.api.getPagedData<User>(`${this.endpoint}/department/${department}`, page, size);
  }

  getActiveUsers(page: number = 0, size: number = 50): Observable<PageResponse<User>> {
    return this.api.getPagedData<User>(`${this.endpoint}/status/ACTIVE`, page, size);
  }

  createUser(user: UserRequest): Observable<User> {
    return this.api.post<User>(this.endpoint, user);
  }

  updateUser(id: number, user: UserRequest): Observable<User> {
    return this.api.put<User>(`${this.endpoint}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<void> {
    const payload = { currentPassword, newPassword };
    return this.api.put<void>(`${this.endpoint}/${userId}/change-password`, payload);
  }

  adminResetPassword(userId: number, newPassword: string): Observable<void> {
    const payload = { newPassword };
    return this.api.put<void>(`${this.endpoint}/${userId}/admin-reset-password`, payload);
  }

  updateUserStatus(userId: number, status: string): Observable<User> {
    return this.api.put<User>(`${this.endpoint}/${userId}/status`, { status });
  }
}