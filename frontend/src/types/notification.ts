export interface OrderSummaryItem {
  id: string;
  orderNumber: string;
  customerName: string;
  createdAt: string;
}

export interface CustomerContactItem {
  id: string;
  name: string;
  nextContactDate: string;
}

export interface ScheduleItem {
  scheduleId: string;
  customerId: string;
  customerName: string;
  phone: string | null;
  reason: string | null;
  scheduledDate: string;
}

export interface NotificationSummary {
  newOrders: number;
  overdueContacts: number;
  activeOrdersTotal: number;
  recentOrders: OrderSummaryItem[];
  overdueCustomers: CustomerContactItem[];
  schedulesToday: number;
  contactsToday: ScheduleItem[];
}
