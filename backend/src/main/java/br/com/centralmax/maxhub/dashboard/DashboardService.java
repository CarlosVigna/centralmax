package br.com.centralmax.maxhub.dashboard;

import br.com.centralmax.maxhub.customer.CustomerInteractionRepository;
import br.com.centralmax.maxhub.customer.CustomerRepository;
import br.com.centralmax.maxhub.financial.FinancialEntryRepository;
import br.com.centralmax.maxhub.financial.FinancialEntryStatus;
import br.com.centralmax.maxhub.financial.FinancialEntryType;
import br.com.centralmax.maxhub.order.OrderRepository;
import br.com.centralmax.maxhub.order.OrderStatus;
import br.com.centralmax.maxhub.product.ProductRepository;
import br.com.centralmax.maxhub.product.ProductStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final CustomerInteractionRepository interactionRepository;
    private final FinancialEntryRepository financialEntryRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getSummary() {
        long activeProducts = productRepository.count(
                (root, query, cb) -> cb.equal(root.get("status"), ProductStatus.ATIVO)
        );
        long totalCustomers = customerRepository.count();
        long totalOrders = orderRepository.count();

        long pendingOrders = orderRepository.countByStatusInAndActive(
                List.of(OrderStatus.NOVO, OrderStatus.CONFIRMADO, OrderStatus.EM_SEPARACAO));
        long ordersOutForDelivery = orderRepository.countByStatusAndActive(OrderStatus.SAIU_ENTREGA);

        Instant todayStart = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant todayEnd = todayStart.plus(1, ChronoUnit.DAYS);
        long ordersToday = orderRepository.countCreatedBetween(todayStart, todayEnd);

        long contactsToday = interactionRepository.countScheduledBetween(todayStart, todayEnd);
        long overdueContacts = interactionRepository.countOverdue(Instant.now());

        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        Instant monthStart = now.withDayOfMonth(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant monthEnd = now.plusMonths(1).withDayOfMonth(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        BigDecimal receitasMes = financialEntryRepository.sumPaidByTypeAndStatusInPeriod(
                FinancialEntryType.RECEITA, FinancialEntryStatus.PAGO, monthStart, monthEnd);
        BigDecimal despesasMes = financialEntryRepository.sumPaidByTypeAndStatusInPeriod(
                FinancialEntryType.DESPESA, FinancialEntryStatus.PAGO, monthStart, monthEnd);
        BigDecimal saldoMes = receitasMes.subtract(despesasMes);
        BigDecimal aReceber = financialEntryRepository.sumByTypeAndStatus(
                FinancialEntryType.RECEITA, FinancialEntryStatus.PENDENTE);

        return new DashboardResponse(activeProducts, totalCustomers, totalOrders,
                pendingOrders, ordersOutForDelivery, ordersToday, contactsToday, overdueContacts,
                saldoMes, aReceber);
    }
}
