package br.com.centralmax.maxhub.report.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record CustomerReportResponse(
        long totalCustomers,
        long newCustomers,
        Map<String, Long> byStatus,
        Map<String, Long> byOrigin,
        List<TopCustomer> topCustomers
) {
    public record TopCustomer(String customerName, long totalOrders, BigDecimal totalSpent) {}
}
