import { api } from './api';

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  commission: number;
}

export interface TopCustomer {
  name: string;
  total: number;
  orderCount: number;
}

export interface VendorSummaryResponse {
  totalOrders: number;
  totalRevenue: number;
  estimatedCommission: number;
  monthlyRevenue: MonthlyRevenue[];
  topCustomers: TopCustomer[];
}

export async function getVendorSummary(year?: number): Promise<VendorSummaryResponse> {
  const { data } = await api.get<VendorSummaryResponse>('/reports/vendor-summary', {
    params: year ? { year } : {},
  });
  return data;
}
