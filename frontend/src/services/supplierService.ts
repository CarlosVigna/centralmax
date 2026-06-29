import { api } from './api';

export interface Supplier {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
}

export async function listSuppliers(): Promise<Supplier[]> {
  const { data } = await api.get<Supplier[]>('/suppliers');
  return data;
}
