package br.com.centralmax.maxhub.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record SalesReportResponse(
        ReportPeriod period,
        long totalOrders,
        BigDecimal totalRevenue,
        BigDecimal averageOrderValue,
        Map<String, Long> ordersByStatus,
        List<TopProduct> topProducts,
        List<DailyRevenue> revenueByDay
) {
    public record ReportPeriod(LocalDate start, LocalDate end) {}

    public record TopProduct(String productName, long quantity, BigDecimal revenue) {}

    public record DailyRevenue(LocalDate date, BigDecimal revenue, long orders) {}
}
