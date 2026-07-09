export type CustomerStatus = 'PROSPECT' | 'ATIVO' | 'INATIVO';

export type CustomerType = 'A' | 'B' | 'C';

export type ProspectStatus =
  | 'NAO_VISITADO'
  | 'VISITADO'
  | 'INTERESSADO'
  | 'ORCAMENTO_ENVIADO'
  | 'NEGOCIANDO'
  | 'CONVERTIDO'
  | 'PERDIDO';

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
  customerType: CustomerType;
  origin: CustomerOrigin;
  originLabel: string;
  notes: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  fullAddress: string | null;
  contactCadenceDays: number | null;
  nextContactDate: string | null;
  lastContactedAt: string | null;
  cadenceLabel: string | null;
  isContactDue: boolean;
  createdAt: string;
  updatedAt: string;
  // CRM fields
  commercialPotential: number | null;
  commercialNotes: string | null;
  businessType: string | null;
  prospectStatus: ProspectStatus | null;
  prospectStatusLabel: string | null;
  lostReason: string | null;
  averageTicket: number | null;
  totalPurchased: number | null;
  lastPurchaseDate: string | null;
  favoriteProducts: string[] | null;
}

export interface CustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  status?: CustomerStatus;
  origin: CustomerOrigin;
  notes?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  contactCadenceDays?: number;
  nextContactDate?: string;
  cadenceReason?: string;
  // CRM fields
  commercialPotential?: number;
  commercialNotes?: string;
  businessType?: string;
  prospectStatus?: ProspectStatus;
  lostReason?: string;
}

export const PROSPECT_STATUS_OPTIONS: { value: ProspectStatus; label: string }[] = [
  { value: 'NAO_VISITADO', label: 'Não visitado' },
  { value: 'VISITADO', label: 'Visitado' },
  { value: 'INTERESSADO', label: 'Interessado' },
  { value: 'ORCAMENTO_ENVIADO', label: 'Orçamento enviado' },
  { value: 'NEGOCIANDO', label: 'Negociando' },
  { value: 'CONVERTIDO', label: 'Convertido' },
  { value: 'PERDIDO', label: 'Perdido' },
];

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
