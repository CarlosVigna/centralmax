export type FeeBase = 'TOTAL' | 'PRODUCTS';

export type ShippingResponsibility = 'CLIENT' | 'SELLER' | 'PLATFORM';

export interface SalesChannel {
  id: string;
  name: string;
  fixedFee: number;
  variableFeePercent: number;
  feeBase: FeeBase;
  feeBaseLabel: string;
  shippingResponsibility: ShippingResponsibility;
  shippingResponsibilityLabel: string;
  notes: string | null;
  active: boolean;
}

export interface SalesChannelRequest {
  name: string;
  fixedFee: number;
  variableFeePercent: number;
  feeBase: FeeBase;
  shippingResponsibility: ShippingResponsibility;
  notes?: string;
}

export const FEE_BASE_OPTIONS: { value: FeeBase; label: string }[] = [
  { value: 'TOTAL', label: 'Valor total do pedido' },
  { value: 'PRODUCTS', label: 'Apenas produtos (sem frete)' },
];

export const SHIPPING_RESPONSIBILITY_OPTIONS: { value: ShippingResponsibility; label: string }[] = [
  { value: 'CLIENT', label: 'Cliente' },
  { value: 'SELLER', label: 'Vendedor' },
  { value: 'PLATFORM', label: 'Plataforma' },
];
