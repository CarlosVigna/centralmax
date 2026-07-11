import { api } from './api';

export interface SalesGoal {
  id: string;
  month: string;
  targetAmount: number;
  createdAt: string;
}

export async function getGoal(month?: string): Promise<SalesGoal | null> {
  try {
    const params = month ? { month } : {};
    const { data } = await api.get<SalesGoal>('/goals', { params });
    return data;
  } catch {
    return null;
  }
}

export async function setGoal(month: string, targetAmount: number): Promise<SalesGoal> {
  const { data } = await api.post<SalesGoal>('/goals', { month: month + '-01', targetAmount });
  return data;
}
