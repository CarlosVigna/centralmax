package br.com.centralmax.maxhub.notification;

import br.com.centralmax.maxhub.crm.ContactSchedule;
import br.com.centralmax.maxhub.crm.ContactScheduleRepository;
import br.com.centralmax.maxhub.crm.ContactScheduleStatus;
import br.com.centralmax.maxhub.customer.CustomerInteraction;
import br.com.centralmax.maxhub.customer.CustomerInteractionRepository;
import br.com.centralmax.maxhub.order.Order;
import br.com.centralmax.maxhub.order.OrderRepository;
import br.com.centralmax.maxhub.order.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final OrderRepository orderRepository;
    private final CustomerInteractionRepository interactionRepository;
    private final ContactScheduleRepository contactScheduleRepository;

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

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        long schedulesToday = contactScheduleRepository.countByScheduledDateAndStatus(today, ContactScheduleStatus.PENDENTE);
        List<ContactSchedule> todayScheduleList = contactScheduleRepository
                .findByScheduledDateAndStatus(today, ContactScheduleStatus.PENDENTE);
        List<NotificationSummaryResponse.ScheduleItem> contactsToday = todayScheduleList.stream()
                .limit(5)
                .map(s -> new NotificationSummaryResponse.ScheduleItem(
                        s.getId(),
                        s.getCustomer().getId(),
                        s.getCustomer().getName(),
                        s.getCustomer().getPhone(),
                        s.getReason(),
                        s.getScheduledDate()))
                .toList();

        return new NotificationSummaryResponse(newOrders, overdueContacts, activeOrdersTotal,
                recentOrders, overdueCustomers, schedulesToday, contactsToday);
    }
}
