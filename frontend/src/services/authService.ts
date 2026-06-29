import { api } from './api';
import type { AuthenticatedUser, LoginResponse } from '../types/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials);
  return data;
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const { data } = await api.get<AuthenticatedUser>('/auth/me');
  return data;
}
