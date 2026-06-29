export type CustomerType = 'A' | 'B' | 'C';
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
  document: string;
  phone: string;
  email: string | null;
  address: string | null;
  customerType: CustomerType;
  status: CustomerStatus;
  origin: CustomerOrigin;
}
