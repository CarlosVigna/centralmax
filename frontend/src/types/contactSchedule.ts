export type ContactScheduleStatus = 'PENDENTE' | 'REALIZADO' | 'CANCELADO';

export interface ContactSchedule {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  customerStatus: string;
  scheduledDate: string;
  reason: string | null;
  status: ContactScheduleStatus;
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
}
