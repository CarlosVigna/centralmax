export type UserRole = 'ADMIN' | 'VENDEDOR';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  commissionPriceA: number | null;
  commissionPriceB: number | null;
  commissionPriceC: number | null;
  territory: string | null;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: AuthenticatedUser;
}
