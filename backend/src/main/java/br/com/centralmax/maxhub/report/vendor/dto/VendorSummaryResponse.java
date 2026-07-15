package br.com.centralmax.maxhub.report.vendor.dto;

import java.math.BigDecimal;
import java.util.List;

public record VendorSummaryResponse(
        int totalOrders,
        BigDecimal totalRevenue,
        BigDecimal estimatedCommission,
        List<MonthlyRevenue> monthlyRevenue,
        List<TopCustomer> topCustomers
) {
    public record MonthlyRevenue(String month, BigDecimal revenue, BigDecimal commission) {}
    public record TopCustomer(String name, BigDecimal total, int orderCount) {}
}
