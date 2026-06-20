export type Role = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  roles: Role[];
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
