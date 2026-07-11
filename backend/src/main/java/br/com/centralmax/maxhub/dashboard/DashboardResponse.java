package br.com.centralmax.maxhub.dashboard;

import java.math.BigDecimal;

public record DashboardResponse(
        long activeProducts,
        long totalCustomers,
        long totalOrders,
        long pendingOrders,
        long ordersOutForDelivery,
        long ordersToday,
        long contactsToday,
        long overdueContacts,
        BigDecimal saldoMes,
        BigDecimal aReceber,
        long ordersToConfirm,
        long ordersToSeparate,
        long overdueFinancial,
        BigDecimal receivableToday,
        BigDecimal receivedToday,
        long schedulesToday,
        long schedulesTomorrow,
        long overdueSchedules,
        BigDecimal billsDueToday,
        BigDecimal billsDueThisWeek,
        BigDecimal overdueBills,
        BigDecimal receitasMes,
        long toReactivateCount
) {}
