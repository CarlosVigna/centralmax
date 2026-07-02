import { api } from './api';
import type { PageResponse } from './productService';
import type {
  FinancialEntryRequest,
  FinancialEntryResponse,
  FinancialFilters,
  FinancialSummaryResponse,
} from '../types/financial';

export async function listFinancialEntries(
  filters: FinancialFilters = {},
): Promise<PageResponse<FinancialEntryResponse>> {
  const { data } = await api.get<PageResponse<FinancialEntryResponse>>('/financial', {
    params: filters,
  });
  return data;
}

export async function getFinancialSummary(
  startDate?: string,
  endDate?: string,
): Promise<FinancialSummaryResponse> {
  const { data } = await api.get<FinancialSummaryResponse>('/financial/summary', {
    params: { startDate, endDate },
  });
  return data;
}

export async function getFinancialEntry(id: string): Promise<FinancialEntryResponse> {
  const { data } = await api.get<FinancialEntryResponse>(`/financial/${id}`);
  return data;
}

export async function createFinancialEntry(
  request: FinancialEntryRequest,
): Promise<FinancialEntryResponse> {
  const { data } = await api.post<FinancialEntryResponse>('/financial', request);
  return data;
}

export async function updateFinancialEntry(
  id: string,
  request: FinancialEntryRequest,
): Promise<FinancialEntryResponse> {
  const { data } = await api.put<FinancialEntryResponse>(`/financial/${id}`, request);
  return data;
}

export async function payFinancialEntry(id: string): Promise<FinancialEntryResponse> {
  const { data } = await api.patch<FinancialEntryResponse>(`/financial/${id}/pay`);
  return data;
}

export async function deleteFinancialEntry(id: string): Promise<void> {
  await api.delete(`/financial/${id}`);
}
