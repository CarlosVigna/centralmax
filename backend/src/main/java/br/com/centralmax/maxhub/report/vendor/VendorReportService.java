package br.com.centralmax.maxhub.report.vendor;

import br.com.centralmax.maxhub.order.Order;
import br.com.centralmax.maxhub.order.OrderRepository;
import br.com.centralmax.maxhub.order.OrderStatus;
import br.com.centralmax.maxhub.report.vendor.dto.VendorSummaryResponse;
import br.com.centralmax.maxhub.security.SecurityUtils;
import br.com.centralmax.maxhub.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VendorReportService {

    private final OrderRepository orderRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public VendorSummaryResponse getSummary(int year) {
        User currentUser = securityUtils.getCurrentUser().orElseThrow();
        UUID userId = currentUser.getId();

        List<OrderStatus> doneStatuses = List.of(
                OrderStatus.CONFIRMADO, OrderStatus.EM_SEPARACAO,
                OrderStatus.SAIU_ENTREGA, OrderStatus.ENTREGUE, OrderStatus.CONCLUIDO);

        List<Order> orders = orderRepository.findAllByCreatedByUserIdAndStatusInAndActiveTrue(userId, doneStatuses);

        // Filter by year
        orders = orders.stream()
                .filter(o -> o.getCreatedAt().atZone(ZoneOffset.UTC).getYear() == year)
                .toList();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        Map<String, BigDecimal[]> monthlyMap = new LinkedHashMap<>();
        Map<String, BigDecimal[]> customerMap = new LinkedHashMap<>();

        // Init all months
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MM/yyyy");
        for (int m = 1; m <= 12; m++) {
            String key = String.format("%02d/%d", m, year);
            monthlyMap.put(key, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
        }

        BigDecimal commissionRate = resolveCommissionRate(currentUser);

        for (Order order : orders) {
            totalRevenue = totalRevenue.add(order.getTotalAmount());
            BigDecimal commission = order.getTotalAmount()
                    .multiply(commissionRate)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            totalCommission = totalCommission.add(commission);

            String month = String.format("%02d/%d",
                    order.getCreatedAt().atZone(ZoneOffset.UTC).getMonthValue(),
                    order.getCreatedAt().atZone(ZoneOffset.UTC).getYear());
            BigDecimal[] mv = monthlyMap.get(month);
            if (mv != null) {
                mv[0] = mv[0].add(order.getTotalAmount());
                mv[1] = mv[1].add(commission);
            }

            String customerName = order.getCustomer() != null
                    ? order.getCustomer().getName() : order.getCustomerName();
            if (customerName != null) {
                BigDecimal[] cv = customerMap.computeIfAbsent(customerName, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
                cv[0] = cv[0].add(order.getTotalAmount());
                cv[1] = cv[1].add(BigDecimal.ONE);
            }
        }

        List<VendorSummaryResponse.MonthlyRevenue> monthly = monthlyMap.entrySet().stream()
                .map(e -> new VendorSummaryResponse.MonthlyRevenue(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .toList();

        List<VendorSummaryResponse.TopCustomer> topCustomers = customerMap.entrySet().stream()
                .sorted((a, b) -> b.getValue()[0].compareTo(a.getValue()[0]))
                .limit(10)
                .map(e -> new VendorSummaryResponse.TopCustomer(
                        e.getKey(), e.getValue()[0], e.getValue()[1].intValue()))
                .toList();

        return new VendorSummaryResponse(orders.size(), totalRevenue, totalCommission, monthly, topCustomers);
    }

    private BigDecimal resolveCommissionRate(User user) {
        if (user.getCommissionPriceA() != null) return user.getCommissionPriceA();
        if (user.getCommissionPriceC() != null) return user.getCommissionPriceC();
        return BigDecimal.ZERO;
    }
}
