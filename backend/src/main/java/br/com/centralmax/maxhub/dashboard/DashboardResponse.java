package br.com.centralmax.maxhub.dashboard;

public record DashboardResponse(
        long activeProducts,
        long totalCustomers,
        long totalOrders
) {
}
