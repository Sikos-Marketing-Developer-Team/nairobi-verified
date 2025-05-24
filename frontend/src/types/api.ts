export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'client' | 'merchant' | 'admin';
  companyName?: string;
  location?: string;
  isEmailVerified?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  companyName?: string;
  location?: string;
  role: 'client' | 'merchant';
}

export interface AuthResponse {
  user: User;
  message: string;
}