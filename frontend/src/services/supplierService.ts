import { api } from './api';

export interface SupplierResponse {
  id: string;
  name: string;
  contactName: string | null;
  document: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
}

export interface SupplierRequest {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

/** @deprecated use SupplierResponse */
export type Supplier = SupplierResponse;

export async function listSuppliers(): Promise<SupplierResponse[]> {
  const { data } = await api.get<SupplierResponse[]>('/suppliers/admin');
  return data;
}

export async function listActiveSuppliers(): Promise<SupplierResponse[]> {
  const { data } = await api.get<SupplierResponse[]>('/suppliers');
  return data;
}

export async function createSupplier(request: SupplierRequest): Promise<SupplierResponse> {
  const { data } = await api.post<SupplierResponse>('/suppliers', request);
  return data;
}

export async function updateSupplier(id: string, request: SupplierRequest): Promise<SupplierResponse> {
  const { data } = await api.put<SupplierResponse>(`/suppliers/${id}`, request);
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await api.delete(`/suppliers/${id}`);
}

export async function activateSupplier(id: string): Promise<SupplierResponse> {
  const { data } = await api.patch<SupplierResponse>(`/suppliers/${id}/activate`);
  return data;
}
