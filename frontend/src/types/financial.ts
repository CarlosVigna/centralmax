export type FinancialEntryType = 'RECEITA' | 'DESPESA';
export type FinancialEntryStatus = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'VENCIDO';

export interface FinancialEntryResponse {
  id: string;
  type: FinancialEntryType;
  typeLabel: string;
  status: FinancialEntryStatus;
  statusLabel: string;
  description: string;
  category: string | null;
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
  category?: string | null;
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
  receitasPendentes: number;
  despesasPendentes: number;
}

export interface FinancialFilters {
  type?: FinancialEntryType;
  status?: FinancialEntryStatus | 'VENCIDO';
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}
