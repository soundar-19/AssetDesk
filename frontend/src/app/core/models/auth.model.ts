import { UserRole } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: UserRole;
  userId: number;
}