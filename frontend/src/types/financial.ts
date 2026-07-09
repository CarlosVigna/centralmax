export type FinancialEntryType = 'RECEITA' | 'DESPESA';
export type FinancialEntryStatus = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'VENCIDO';

export interface FinancialEntryResponse {
  id: string;
  type: FinancialEntryType;
  typeLabel: string;
  status: FinancialEntryStatus;
  statusLabel: string;
  description: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  orderId: string | null;
  orderNumber: string | null;
  notes: string | null;
  createdAt: string;
}

export interface FinancialEntryRequest {
  type: FinancialEntryType;
  description: string;
  amount: number;
  dueDate: string;
  orderId?: string | null;
  notes?: string | null;
}

export interface FinancialSummaryResponse {
  saldoMes: number;
  aReceber: number;
  receitas: number;
  despesas: number;
  vencidos: number;
}

export interface FinancialFilters {
  type?: FinancialEntryType;
  status?: FinancialEntryStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}
