package br.com.centralmax.maxhub.report;

import br.com.centralmax.maxhub.customer.CustomerRepository;
import br.com.centralmax.maxhub.order.Order;
import br.com.centralmax.maxhub.order.OrderRepository;
import br.com.centralmax.maxhub.order.OrderStatus;
import br.com.centralmax.maxhub.report.dto.ChannelProfitabilityResponse;
import br.com.centralmax.maxhub.report.dto.CustomerReportResponse;
import br.com.centralmax.maxhub.report.dto.SalesReportResponse;
import br.com.centralmax.maxhub.report.dto.WeeklyForecastResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
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

    @Transactional(readOnly = true)
    public WeeklyForecastResponse getWeeklyForecast() {
        Instant now = Instant.now();
        Instant start30 = now.minusSeconds(30L * 24 * 3600);
        Instant start15 = now.minusSeconds(15L * 24 * 3600);

        List<WeeklyForecastResponse.ForecastItem> items = orderRepository
                .findWeeklyForecastData(start30, start15)
                .stream()
                .map(row -> {
                    String productId   = row[0].toString();
                    String productName = (String) row[1];
                    String sku         = row[2] != null ? (String) row[2] : "";
                    int    total30     = ((Number) row[3]).intValue();
                    int    last15      = ((Number) row[4]).intValue();
                    int    prev15      = ((Number) row[5]).intValue();

                    double avgDaily   = total30 / 30.0;
                    int    forecast   = (int) Math.ceil(avgDaily * 7);

                    String trend;
                    if (prev15 == 0) {
                        trend = last15 > 0 ? "UP" : "STABLE";
                    } else {
                        double ratio = (double) last15 / prev15;
                        trend = ratio >= 1.1 ? "UP" : ratio <= 0.9 ? "DOWN" : "STABLE";
                    }

                    return new WeeklyForecastResponse.ForecastItem(
                            productId, productName, sku,
                            Math.round(avgDaily * 100.0) / 100.0,
                            forecast, total30, trend);
                })
                .toList();

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        String period = today.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                + " – " + today.plusDays(6).format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        return new WeeklyForecastResponse(period, items);
    }

    @Transactional(readOnly = true)
    public ChannelProfitabilityResponse getChannelProfitability(LocalDate startDate, LocalDate endDate, List<java.util.UUID> channelIds) {
        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = startDate != null ? startDate : now.withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : now.withDayOfMonth(now.lengthOfMonth());

        Instant instantStart = start.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant instantEnd = end.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<Order> orders = orderRepository.findForChannelProfitability(instantStart, instantEnd);
        if (channelIds != null && !channelIds.isEmpty()) {
            orders = orders.stream()
                    .filter(o -> channelIds.contains(o.getSalesChannel().getId()))
                    .toList();
        }

        Map<String, BigDecimal[]> byChannel = new LinkedHashMap<>();
        // Cada entrada: [orders, grossRevenue, totalFees, netProfit]
        for (Order order : orders) {
            String channelName = order.getSalesChannel().getName();
            BigDecimal[] agg = byChannel.computeIfAbsent(channelName,
                    k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal totalFee = order.getChannelTotalFee() != null ? order.getChannelTotalFee() : BigDecimal.ZERO;
            BigDecimal netProfit = order.getNetProfit() != null ? order.getNetProfit() : BigDecimal.ZERO;

            agg[0] = agg[0].add(BigDecimal.ONE);
            agg[1] = agg[1].add(totalAmount);
            agg[2] = agg[2].add(totalFee);
            agg[3] = agg[3].add(netProfit);
        }

        List<ChannelProfitabilityResponse.ChannelProfitability> channels = byChannel.entrySet().stream()
                .map(e -> {
                    long totalOrders = e.getValue()[0].longValue();
                    BigDecimal grossRevenue = e.getValue()[1];
                    BigDecimal totalFees = e.getValue()[2];
                    BigDecimal netProfit = e.getValue()[3];
                    BigDecimal vendorCommissions = grossRevenue.subtract(totalFees).subtract(netProfit);
                    BigDecimal profitMargin = grossRevenue.compareTo(BigDecimal.ZERO) > 0
                            ? netProfit.divide(grossRevenue, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                            : BigDecimal.ZERO;
                    BigDecimal avgOrderValue = totalOrders > 0
                            ? grossRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    return new ChannelProfitabilityResponse.ChannelProfitability(
                            e.getKey(), totalOrders, grossRevenue, totalFees, vendorCommissions,
                            netProfit, profitMargin.setScale(2, RoundingMode.HALF_UP), avgOrderValue);
                })
                .sorted((a, b) -> b.grossRevenue().compareTo(a.grossRevenue()))
                .toList();

        long totalOrders = channels.stream().mapToLong(ChannelProfitabilityResponse.ChannelProfitability::totalOrders).sum();
        BigDecimal totalGrossRevenue = channels.stream().map(ChannelProfitabilityResponse.ChannelProfitability::grossRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalFees = channels.stream().map(ChannelProfitabilityResponse.ChannelProfitability::totalFees)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalVendorCommissions = channels.stream().map(ChannelProfitabilityResponse.ChannelProfitability::vendorCommissions)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNetProfit = channels.stream().map(ChannelProfitabilityResponse.ChannelProfitability::netProfit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalMargin = totalGrossRevenue.compareTo(BigDecimal.ZERO) > 0
                ? totalNetProfit.divide(totalGrossRevenue, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        String period = start.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                + " a " + end.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        return new ChannelProfitabilityResponse(
                period,
                channels,
                new ChannelProfitabilityResponse.Totals(
                        totalOrders, totalGrossRevenue, totalFees, totalVendorCommissions,
                        totalNetProfit, totalMargin.setScale(2, RoundingMode.HALF_UP)));
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
