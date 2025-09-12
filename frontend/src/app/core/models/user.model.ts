export type UserRole = 'EMPLOYEE' | 'ADMIN' | 'IT_SUPPORT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  department: string;
  designation: string;
  status: UserStatus;
  dateJoined: string;
  lastLogin?: string;
}

export interface UserRequest {
  employeeId: string;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: UserRole;
  department: string;
  designation: string;
  status: UserStatus;
  dateJoined: string;
}