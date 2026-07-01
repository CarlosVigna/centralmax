package br.com.centralmax.maxhub.dashboard;

public record DashboardResponse(
        long activeProducts,
        long totalCustomers,
        long totalOrders,
        long pendingOrders,
        long ordersOutForDelivery,
        long ordersToday,
        long contactsToday,
        long overdueContacts
) {}
