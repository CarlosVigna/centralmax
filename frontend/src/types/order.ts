export type OrderStatus =
  | 'NOVO'
  | 'CONFIRMADO'
  | 'EM_SEPARACAO'
  | 'SAIU_ENTREGA'
  | 'ENTREGUE'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type PaymentStatus = 'PAGO' | 'PENDENTE' | 'SEM_REGISTRO';

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
  paymentStatus: PaymentStatus;
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
