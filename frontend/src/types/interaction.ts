export type InteractionType = 'LIGACAO' | 'WHATSAPP' | 'EMAIL' | 'VISITA' | 'REUNIAO' | 'NOTA';

export interface Interaction {
  id: string;
  customerId: string;
  customerName: string;
  type: InteractionType;
  notes: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface InteractionRequest {
  type: InteractionType;
  notes?: string;
  scheduledAt?: string | null;
}

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  LIGACAO: 'Ligação',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
  VISITA: 'Visita',
  REUNIAO: 'Reunião',
  NOTA: 'Nota',
};

export const INTERACTION_TYPE_OPTIONS: { value: InteractionType; label: string }[] = [
  { value: 'LIGACAO', label: 'Ligação' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'VISITA', label: 'Visita' },
  { value: 'REUNIAO', label: 'Reunião' },
  { value: 'NOTA', label: 'Nota' },
];
