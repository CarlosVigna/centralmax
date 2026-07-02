import { api } from './api';

export interface ReportPeriod {
  start: string;
  end: string;
}

export interface TopProduct {
  productName: string;
  quantity: number;
  revenue: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface SalesReportResponse {
  period: ReportPeriod;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  topProducts: TopProduct[];
  revenueByDay: DailyRevenue[];
}

export interface TopCustomer {
  customerName: string;
  totalOrders: number;
  totalSpent: number;
}

export interface CustomerReportResponse {
  totalCustomers: number;
  newCustomers: number;
  byStatus: Record<string, number>;
  byOrigin: Record<string, number>;
  topCustomers: TopCustomer[];
}

export async function getSalesReport(
  startDate?: string,
  endDate?: string,
): Promise<SalesReportResponse> {
  const { data } = await api.get<SalesReportResponse>('/reports/sales', {
    params: { startDate, endDate },
  });
  return data;
}

export async function getCustomerReport(
  startDate?: string,
  endDate?: string,
): Promise<CustomerReportResponse> {
  const { data } = await api.get<CustomerReportResponse>('/reports/customers', {
    params: { startDate, endDate },
  });
  return data;
}
