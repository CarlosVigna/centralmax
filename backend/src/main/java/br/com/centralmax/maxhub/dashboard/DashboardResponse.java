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
        BigDecimal aReceber
) {}
