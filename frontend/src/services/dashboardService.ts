import { api } from './api';

export interface DashboardStats {
  activeProducts: number;
  totalCustomers: number;
  totalOrders: number;
}

export async function getDashboard(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/dashboard');
  return data;
}
