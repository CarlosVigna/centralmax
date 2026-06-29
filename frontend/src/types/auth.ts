export type UserRole = 'ADMIN' | 'VENDEDOR';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: AuthenticatedUser;
}
