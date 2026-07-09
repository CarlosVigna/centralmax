export type ContactScheduleStatus = 'PENDENTE' | 'REALIZADO' | 'CANCELADO';

export type ContactResult =
  | 'COMPROU'
  | 'NAO_ATENDEU'
  | 'VAI_PENSAR'
  | 'SEM_INTERESSE'
  | 'SEM_DINHEIRO'
  | 'COMPRA_CONCORRENTE'
  | 'LIGA_DEPOIS'
  | 'REAGENDADO';

export interface ContactSchedule {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  customerStatus: string;
  scheduledDate: string;
  reason: string | null;
  status: ContactScheduleStatus;
  result: ContactResult | null;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  nextContactDate: string | null;
}

export interface ContactScheduleRequest {
  scheduledDate: string;
  reason?: string;
}

export interface CompleteScheduleRequest {
  notes?: string;
  result: ContactResult;
  rescheduledTo?: string;
}

export const CONTACT_RESULT_OPTIONS: { value: ContactResult; label: string; emoji: string }[] = [
  { value: 'COMPROU', label: 'Comprou', emoji: '✅' },
  { value: 'NAO_ATENDEU', label: 'Não atendeu', emoji: '📵' },
  { value: 'VAI_PENSAR', label: 'Vai pensar', emoji: '🤔' },
  { value: 'SEM_INTERESSE', label: 'Sem interesse', emoji: '❌' },
  { value: 'SEM_DINHEIRO', label: 'Sem dinheiro agora', emoji: '💸' },
  { value: 'COMPRA_CONCORRENTE', label: 'Compra do concorrente', emoji: '🏪' },
  { value: 'LIGA_DEPOIS', label: 'Liga depois', emoji: '📞' },
  { value: 'REAGENDADO', label: 'Reagendar para outra data', emoji: '📅' },
];
