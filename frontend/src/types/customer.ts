export type CustomerStatus = 'PROSPECT' | 'ATIVO' | 'INATIVO';

export type CustomerOrigin =
  | 'LANDING'
  | 'WHATSAPP'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'MERCADO_LIVRE'
  | 'SHOPEE'
  | 'TIKTOK'
  | 'VISITA'
  | 'INDICACAO'
  | 'TELEFONE';

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  status: CustomerStatus;
  statusLabel: string;
  origin: CustomerOrigin;
  originLabel: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  status?: CustomerStatus;
  origin: CustomerOrigin;
  notes?: string;
}

export const ORIGIN_OPTIONS: { value: CustomerOrigin; label: string }[] = [
  { value: 'LANDING', label: 'Landing Page' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'MERCADO_LIVRE', label: 'Mercado Livre' },
  { value: 'SHOPEE', label: 'Shopee' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'VISITA', label: 'Visita' },
  { value: 'INDICACAO', label: 'Indicação' },
  { value: 'TELEFONE', label: 'Telefone' },
];

export const STATUS_OPTIONS: { value: CustomerStatus; label: string }[] = [
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Inativo' },
];
