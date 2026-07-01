import { api } from './api';

export interface DashboardStats {
  activeProducts: number;
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  ordersOutForDelivery: number;
  ordersToday: number;
  contactsToday: number;
  overdueContacts: number;
}

export async function getDashboard(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/dashboard');
  return data;
}
