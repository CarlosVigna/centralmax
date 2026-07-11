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
  saldoMes: number;
  aReceber: number;
  ordersToConfirm: number;
  ordersToSeparate: number;
  overdueFinancial: number;
  receivableToday: number;
  receivedToday: number;
  schedulesToday: number;
  schedulesTomorrow: number;
  overdueSchedules: number;
  billsDueToday: number;
  billsDueThisWeek: number;
  overdueBills: number;
}

export async function getDashboard(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/dashboard');
  return data;
}
