package br.com.centralmax.maxhub.order;

import br.com.centralmax.maxhub.common.exception.BusinessException;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.common.response.PageResponse;
import br.com.centralmax.maxhub.customer.Customer;
import br.com.centralmax.maxhub.customer.CustomerRepository;
import br.com.centralmax.maxhub.customer.CustomerType;
import br.com.centralmax.maxhub.financial.FinancialEntry;
import br.com.centralmax.maxhub.financial.FinancialEntryRepository;
import br.com.centralmax.maxhub.financial.FinancialEntryStatus;
import br.com.centralmax.maxhub.financial.FinancialEntryType;
import br.com.centralmax.maxhub.order.dto.OrderRequest;
import br.com.centralmax.maxhub.order.dto.OrderResponse;
import br.com.centralmax.maxhub.order.dto.OrderStatusUpdateRequest;
import br.com.centralmax.maxhub.product.Product;
import br.com.centralmax.maxhub.product.ProductRepository;
import br.com.centralmax.maxhub.stock.StockMovement;
import br.com.centralmax.maxhub.stock.StockMovementRepository;
import br.com.centralmax.maxhub.stock.StockMovementType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final List<OrderStatus> STATUS_ORDER = List.of(
            OrderStatus.NOVO, OrderStatus.CONFIRMADO, OrderStatus.EM_SEPARACAO,
            OrderStatus.SAIU_ENTREGA, OrderStatus.ENTREGUE, OrderStatus.CONCLUIDO
    );

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final FinancialEntryRepository financialEntryRepository;
    private final OrderMapper orderMapper;

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> list(OrderStatus status, String search, UUID customerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> result = orderRepository.findAll(buildSpec(status, search, customerId), pageable);
        return PageResponse.from(result.map(orderMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(UUID id) {
        return orderMapper.toResponse(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getBoard() {
        List<OrderStatus> boardStatuses = List.of(
                OrderStatus.NOVO, OrderStatus.CONFIRMADO, OrderStatus.EM_SEPARACAO,
                OrderStatus.SAIU_ENTREGA, OrderStatus.ENTREGUE);
        return orderRepository.findBoardOrders(boardStatuses)
                .stream().map(orderMapper::toResponse).toList();
    }

    @Transactional
    public OrderResponse create(OrderRequest request) {
        Customer customer = null;
        String customerName;
        String customerPhone;
        CustomerType customerType = CustomerType.C;

        if (request.customerId() != null) {
            customer = customerRepository.findById(request.customerId())
                    .filter(Customer::isActive)
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));
            customerName = customer.getName();
            customerPhone = customer.getPhone();
            customerType = customer.getCustomerType() != null ? customer.getCustomerType() : CustomerType.C;
        } else {
            if (request.customerName() == null || request.customerName().isBlank()) {
                throw new BusinessException("Nome do cliente é obrigatório para pedido avulso");
            }
            customerName = request.customerName().trim();
            customerPhone = request.customerPhone() != null ? request.customerPhone().trim() : null;
        }

        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customer(customer)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .status(OrderStatus.NOVO)
                .notes(blankToNull(request.notes()))
                .totalAmount(BigDecimal.ZERO)
                .build();
        order = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
        List<StockMovement> movements = new ArrayList<>();

        for (var itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Produto " + itemReq.productId() + " não encontrado"));

            BigDecimal unitPrice = resolvePrice(product, customerType);
            BigDecimal discount = itemReq.discountPercent() != null
                    ? itemReq.discountPercent() : BigDecimal.ZERO;
            BigDecimal finalPrice = applyDiscount(unitPrice, discount);
            BigDecimal subtotal = finalPrice.multiply(BigDecimal.valueOf(itemReq.quantity()));

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .quantity(itemReq.quantity())
                    .unitPrice(unitPrice)
                    .discountPercent(discount)
                    .subtotal(subtotal)
                    .build();
            order.getItems().add(item);
            total = total.add(subtotal);

            movements.add(StockMovement.builder()
                    .product(product)
                    .order(order)
                    .type(StockMovementType.SAIDA)
                    .quantity(itemReq.quantity())
                    .notes("Pedido " + orderNumber)
                    .build());
        }

        order.setTotalAmount(total);
        order = orderRepository.save(order);
        stockMovementRepository.saveAll(movements);

        return orderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse duplicate(UUID id) {
        Order original = findOrThrow(id);

        String orderNumber = generateOrderNumber();

        Order copy = Order.builder()
                .orderNumber(orderNumber)
                .customer(original.getCustomer())
                .customerName(original.getCustomerName())
                .customerPhone(original.getCustomerPhone())
                .status(OrderStatus.NOVO)
                .notes(original.getNotes())
                .totalAmount(BigDecimal.ZERO)
                .build();
        copy = orderRepository.save(copy);

        CustomerType customerType = (original.getCustomer() != null
                && original.getCustomer().getCustomerType() != null)
                ? original.getCustomer().getCustomerType()
                : CustomerType.C;

        BigDecimal total = BigDecimal.ZERO;
        List<StockMovement> movements = new ArrayList<>();

        for (OrderItem origItem : original.getItems()) {
            Product product = origItem.getProduct();
            BigDecimal unitPrice = resolvePrice(product, customerType);
            BigDecimal discount = origItem.getDiscountPercent() != null
                    ? origItem.getDiscountPercent() : BigDecimal.ZERO;
            BigDecimal finalPrice = applyDiscount(unitPrice, discount);
            BigDecimal subtotal = finalPrice.multiply(BigDecimal.valueOf(origItem.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .order(copy)
                    .product(product)
                    .productName(product.getName())
                    .quantity(origItem.getQuantity())
                    .unitPrice(unitPrice)
                    .discountPercent(discount)
                    .subtotal(subtotal)
                    .build();
            copy.getItems().add(item);
            total = total.add(subtotal);

            movements.add(StockMovement.builder()
                    .product(product)
                    .order(copy)
                    .type(StockMovementType.SAIDA)
                    .quantity(origItem.getQuantity())
                    .notes("Duplicado de " + original.getOrderNumber())
                    .build());
        }

        copy.setTotalAmount(total);
        copy = orderRepository.save(copy);
        stockMovementRepository.saveAll(movements);

        return orderMapper.toResponse(copy);
    }

    @Transactional
    public OrderResponse updateStatus(UUID id, OrderStatusUpdateRequest request) {
        Order order = findOrThrow(id);
        validateStatusTransition(order.getStatus(), request.status());
        order.setStatus(request.status());
        order = orderRepository.save(order);

        if (request.status() == OrderStatus.CONCLUIDO) {
            FinancialEntry entry = FinancialEntry.builder()
                    .type(FinancialEntryType.RECEITA)
                    .status(FinancialEntryStatus.PENDENTE)
                    .description("Pedido " + order.getOrderNumber())
                    .amount(order.getTotalAmount())
                    .dueDate(LocalDate.now())
                    .order(order)
                    .build();
            financialEntryRepository.save(entry);
        }

        return orderMapper.toResponse(order);
    }

    @Transactional
    public void delete(UUID id) {
        Order order = findOrThrow(id);
        if (order.getStatus() != OrderStatus.NOVO && order.getStatus() != OrderStatus.CANCELADO) {
            throw new BusinessException("Só é possível excluir pedidos com status NOVO ou CANCELADO");
        }
        order.setActive(false);
        orderRepository.save(order);
    }

    private BigDecimal resolvePrice(Product product, CustomerType type) {
        return switch (type) {
            case A -> product.getPriceA();
            case B -> product.getPriceB();
            default -> product.getPriceC();
        };
    }

    private BigDecimal applyDiscount(BigDecimal price, BigDecimal discountPercent) {
        if (discountPercent == null || discountPercent.compareTo(BigDecimal.ZERO) == 0) return price;
        BigDecimal factor = BigDecimal.ONE.subtract(
                discountPercent.divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP));
        return price.multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        if (next == OrderStatus.CANCELADO) {
            if (current == OrderStatus.CONCLUIDO || current == OrderStatus.CANCELADO) {
                throw new BusinessException("Pedido já " +
                        (current == OrderStatus.CONCLUIDO ? "concluído" : "cancelado") +
                        " não pode ser cancelado");
            }
            return;
        }
        int currentIdx = STATUS_ORDER.indexOf(current);
        int nextIdx = STATUS_ORDER.indexOf(next);
        if (currentIdx < 0 || nextIdx != currentIdx + 1) {
            throw new BusinessException("Transição de status inválida: " + current + " → " + next);
        }
    }

    private String generateOrderNumber() {
        Long seq = orderRepository.nextOrderNumber();
        String year = String.valueOf(Year.now().getValue());
        return String.format("CM-%s-%04d", year, seq);
    }

    private Order findOrThrow(UUID id) {
        return orderRepository.findById(id)
                .filter(Order::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado"));
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private Specification<Order> buildSpec(OrderStatus status, String search, UUID customerId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("active")));

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("orderNumber")), pattern),
                        cb.like(cb.lower(root.get("customerName")), pattern)
                ));
            }
            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
