export type OrderStatus = 'ORCAMENTO' | 'CONFIRMADO' | 'EM_PREPARACAO' | 'CONCLUIDO' | 'CANCELADO';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  origin: string;
  total: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
}
