package br.com.centralmax.maxhub.report;

import br.com.centralmax.maxhub.customer.CustomerRepository;
import br.com.centralmax.maxhub.order.OrderRepository;
import br.com.centralmax.maxhub.order.OrderStatus;
import br.com.centralmax.maxhub.report.dto.CustomerReportResponse;
import br.com.centralmax.maxhub.report.dto.SalesReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public SalesReportResponse getSalesReport(LocalDate startDate, LocalDate endDate) {
        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = startDate != null ? startDate : now.withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : now.withDayOfMonth(now.lengthOfMonth());

        Instant instantStart = start.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant instantEnd = end.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        long totalOrders = orderRepository.countCreatedBetween(instantStart, instantEnd);
        BigDecimal totalRevenue = orderRepository.sumRevenueInPeriod(instantStart, instantEnd, OrderStatus.CANCELADO);
        BigDecimal averageOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (Object[] row : orderRepository.countByStatusInPeriod(instantStart, instantEnd)) {
            ordersByStatus.put((String) row[0], ((Number) row[1]).longValue());
        }

        List<SalesReportResponse.TopProduct> topProducts = orderRepository
                .findTopProductsInPeriod(instantStart, instantEnd)
                .stream()
                .map(row -> new SalesReportResponse.TopProduct(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        toBigDecimal(row[2])))
                .toList();

        List<SalesReportResponse.DailyRevenue> revenueByDay = orderRepository
                .findRevenueByDayInPeriod(instantStart, instantEnd)
                .stream()
                .map(row -> new SalesReportResponse.DailyRevenue(
                        toLocalDate(row[0]),
                        toBigDecimal(row[1]),
                        ((Number) row[2]).longValue()))
                .toList();

        return new SalesReportResponse(
                new SalesReportResponse.ReportPeriod(start, end),
                totalOrders,
                totalRevenue,
                averageOrderValue,
                ordersByStatus,
                topProducts,
                revenueByDay
        );
    }

    @Transactional(readOnly = true)
    public CustomerReportResponse getCustomerReport(LocalDate startDate, LocalDate endDate) {
        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = startDate != null ? startDate : now.withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : now.withDayOfMonth(now.lengthOfMonth());

        Instant instantStart = start.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant instantEnd = end.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        long totalCustomers = customerRepository.count();
        long newCustomers = customerRepository.countNewInPeriod(instantStart, instantEnd);

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (Object[] row : customerRepository.countByStatus()) {
            byStatus.put((String) row[0], ((Number) row[1]).longValue());
        }

        Map<String, Long> byOrigin = new LinkedHashMap<>();
        for (Object[] row : customerRepository.countByOrigin()) {
            byOrigin.put((String) row[0], ((Number) row[1]).longValue());
        }

        List<CustomerReportResponse.TopCustomer> topCustomers = customerRepository.findTopCustomers()
                .stream()
                .map(row -> new CustomerReportResponse.TopCustomer(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        toBigDecimal(row[2])))
                .toList();

        return new CustomerReportResponse(totalCustomers, newCustomers, byStatus, byOrigin, topCustomers);
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        return new BigDecimal(value.toString());
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof java.sql.Date d) return d.toLocalDate();
        return LocalDate.parse(value.toString());
    }
}
