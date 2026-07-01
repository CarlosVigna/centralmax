package br.com.centralmax.maxhub.notification;

import br.com.centralmax.maxhub.customer.CustomerInteraction;
import br.com.centralmax.maxhub.customer.CustomerInteractionRepository;
import br.com.centralmax.maxhub.order.Order;
import br.com.centralmax.maxhub.order.OrderRepository;
import br.com.centralmax.maxhub.order.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final OrderRepository orderRepository;
    private final CustomerInteractionRepository interactionRepository;

    private static final List<OrderStatus> BOARD_STATUSES = List.of(
            OrderStatus.NOVO, OrderStatus.CONFIRMADO, OrderStatus.EM_SEPARACAO,
            OrderStatus.SAIU_ENTREGA, OrderStatus.ENTREGUE);

    @Transactional(readOnly = true)
    public NotificationSummaryResponse getSummary() {
        long newOrders = orderRepository.countByStatusAndActive(OrderStatus.NOVO);
        long overdueContacts = interactionRepository.countOverdue(Instant.now());
        long activeOrdersTotal = orderRepository.countByStatusInAndActive(BOARD_STATUSES);

        List<Order> recentOrdersList = orderRepository
                .findTop5ByStatusAndActiveOrderByCreatedAtDesc(OrderStatus.NOVO, true);

        List<NotificationSummaryResponse.OrderSummaryItem> recentOrders = recentOrdersList.stream()
                .map(o -> new NotificationSummaryResponse.OrderSummaryItem(
                        o.getId(), o.getOrderNumber(), o.getCustomerName(), o.getCreatedAt()))
                .toList();

        List<CustomerInteraction> overdueList = interactionRepository.findOverdue(Instant.now());
        List<NotificationSummaryResponse.CustomerContactItem> overdueCustomers = overdueList.stream()
                .limit(5)
                .map(i -> new NotificationSummaryResponse.CustomerContactItem(
                        i.getCustomer().getId(), i.getCustomer().getName(), i.getScheduledAt()))
                .toList();

        return new NotificationSummaryResponse(newOrders, overdueContacts, activeOrdersTotal,
                recentOrders, overdueCustomers);
    }
}
