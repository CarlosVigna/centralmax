package br.com.centralmax.maxhub.notification;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record NotificationSummaryResponse(
        long newOrders,
        long overdueContacts,
        long activeOrdersTotal,
        List<OrderSummaryItem> recentOrders,
        List<CustomerContactItem> overdueCustomers
) {

    public record OrderSummaryItem(
            UUID id,
            String orderNumber,
            String customerName,
            Instant createdAt
    ) {}

    public record CustomerContactItem(
            UUID id,
            String name,
            Instant nextContactDate
    ) {}
}
