export type OrderStatus =
  | 'NOVO'
  | 'CONFIRMADO'
  | 'EM_SEPARACAO'
  | 'SAIU_ENTREGA'
  | 'ENTREGUE'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type PaymentCondition =
  | 'A_VISTA'
  | 'NA_ENTREGA'
  | 'TRINTA_DIAS'
  | 'SESSENTA_DIAS'
  | 'NOVENTA_DIAS';

export type FinancialStatus = 'SEM_TITULO' | 'PENDENTE' | 'PAGO' | 'VENCIDO';

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  finalUnitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerDisplayName: string;
  customerDisplayPhone: string | null;
  status: OrderStatus;
  statusLabel: string;
  paymentCondition: PaymentCondition;
  paymentConditionLabel: string;
  dueDate: string | null;
  financialStatus: FinancialStatus;
  notes: string | null;
  totalAmount: number;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
  discountPercent?: number;
}

export interface OrderRequest {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  items: OrderItemRequest[];
  paymentCondition?: PaymentCondition;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  NOVO: 'Novo',
  CONFIRMADO: 'Confirmado',
  EM_SEPARACAO: 'Em Separação',
  SAIU_ENTREGA: 'Saiu p/ Entrega',
  ENTREGUE: 'Entregue',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

export const PAYMENT_CONDITION_LABELS: Record<PaymentCondition, string> = {
  A_VISTA: 'À Vista',
  NA_ENTREGA: 'Na Entrega',
  TRINTA_DIAS: '30 dias',
  SESSENTA_DIAS: '60 dias',
  NOVENTA_DIAS: '90 dias',
};

export const STATUS_FLOW: OrderStatus[] = [
  'NOVO',
  'CONFIRMADO',
  'EM_SEPARACAO',
  'SAIU_ENTREGA',
  'ENTREGUE',
  'CONCLUIDO',
];

export const STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  'neutral' | 'info' | 'warning' | 'success' | 'danger'
> = {
  NOVO: 'neutral',
  CONFIRMADO: 'info',
  EM_SEPARACAO: 'warning',
  SAIU_ENTREGA: 'info',
  ENTREGUE: 'success',
  CONCLUIDO: 'success',
  CANCELADO: 'danger',
};

export function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export function previousStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx <= 0) return null;
  return STATUS_FLOW[idx - 1];
}
