import { api } from './api';

export type UserRole = 'ADMIN' | 'VENDEDOR';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface ChangePasswordRequest {
  password: string;
}

export async function listUsers(): Promise<UserResponse[]> {
  const { data } = await api.get<UserResponse[]>('/users');
  return data;
}

export async function createUser(request: UserRequest): Promise<UserResponse> {
  const { data } = await api.post<UserResponse>('/users', request);
  return data;
}

export async function updateUser(id: string, request: UserRequest): Promise<UserResponse> {
  const { data } = await api.put<UserResponse>(`/users/${id}`, request);
  return data;
}

export async function changeUserPassword(id: string, request: ChangePasswordRequest): Promise<void> {
  await api.patch(`/users/${id}/password`, request);
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
