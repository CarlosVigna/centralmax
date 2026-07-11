package br.com.centralmax.maxhub.order;

import br.com.centralmax.maxhub.common.exception.BusinessException;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.common.response.PageResponse;
import br.com.centralmax.maxhub.customer.Customer;
import br.com.centralmax.maxhub.customer.CustomerRepository;
import br.com.centralmax.maxhub.customer.CustomerService;
import br.com.centralmax.maxhub.customer.CustomerType;
import br.com.centralmax.maxhub.financial.FinancialEntryService;
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
import java.util.Map;
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
    private final FinancialEntryService financialEntryService;
    private final CustomerService customerService;
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

        PaymentCondition paymentCondition = request.paymentCondition() != null
                ? request.paymentCondition() : PaymentCondition.NA_ENTREGA;

        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customer(customer)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .status(OrderStatus.NOVO)
                .notes(blankToNull(request.notes()))
                .totalAmount(BigDecimal.ZERO)
                .paymentCondition(paymentCondition)
                .nfNumber(blankToNull(request.nfNumber()))
                .estimatedDeliveryDate(request.estimatedDeliveryDate())
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
    public OrderResponse update(UUID id, OrderRequest request) {
        Order order = findOrThrow(id);
        if (order.getStatus() != OrderStatus.NOVO && order.getStatus() != OrderStatus.CONFIRMADO) {
            throw new BusinessException("Só é possível editar pedidos com status NOVO ou CONFIRMADO");
        }

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

        order.setCustomer(customer);
        order.setCustomerName(customerName);
        order.setCustomerPhone(customerPhone);
        order.setNotes(blankToNull(request.notes()));
        order.setNfNumber(blankToNull(request.nfNumber()));
        order.setEstimatedDeliveryDate(request.estimatedDeliveryDate());

        if (request.paymentCondition() != null) {
            order.setPaymentCondition(request.paymentCondition());
        }

        // Clear and rebuild items
        order.getItems().clear();
        order = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
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
        }

        order.setTotalAmount(total);
        order = orderRepository.save(order);

        if (order.getStatus() == OrderStatus.CONFIRMADO) {
            financialEntryService.updateAmountByOrderId(id, total);
        }

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
                .paymentCondition(original.getPaymentCondition() != null
                        ? original.getPaymentCondition() : PaymentCondition.NA_ENTREGA)
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

        if (request.status() == OrderStatus.CONFIRMADO) {
            LocalDate dueDate = calculateDueDate(order.getPaymentCondition());
            order.setDueDate(dueDate);
            order = orderRepository.save(order);
            financialEntryService.createFromOrder(order);
        } else if (request.status() == OrderStatus.ENTREGUE
                && order.getPaymentCondition() == PaymentCondition.NA_ENTREGA) {
            LocalDate today = LocalDate.now();
            order.setDueDate(today);
            order = orderRepository.save(order);
            financialEntryService.updateDueDateByOrderId(id, today);
        } else if (request.status() == OrderStatus.CONCLUIDO) {
            order = orderRepository.save(order);
            financialEntryService.markAsPaidByOrderId(id);
            if (order.getCustomer() != null) {
                customerService.updateCustomerStats(order.getCustomer().getId());
            }
        } else {
            order = orderRepository.save(order);
        }

        return orderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse revertStatus(UUID id) {
        Order order = findOrThrow(id);
        OrderStatus current = order.getStatus();

        if (current == OrderStatus.NOVO) {
            throw new BusinessException("Pedido NOVO não pode ter o status revertido");
        }
        if (current == OrderStatus.CANCELADO) {
            throw new BusinessException("Pedido CANCELADO não pode ter o status revertido");
        }

        int idx = STATUS_ORDER.indexOf(current);
        OrderStatus previous = STATUS_ORDER.get(idx - 1);

        if (current == OrderStatus.CONCLUIDO) {
            financialEntryService.revertPaidByOrderId(id);
            if (order.getCustomer() != null) {
                customerService.updateCustomerStats(order.getCustomer().getId());
            }
        } else if (current == OrderStatus.CONFIRMADO) {
            financialEntryService.deleteByOrderId(id);
            order.setDueDate(null);
        }

        order.setStatus(previous);
        order = orderRepository.save(order);
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

    @Transactional(readOnly = true)
    public br.com.centralmax.maxhub.order.dto.PurchaseListResponse getPurchaseList(List<OrderStatus> statuses) {
        if (statuses == null || statuses.isEmpty()) {
            statuses = List.of(OrderStatus.CONFIRMADO, OrderStatus.EM_SEPARACAO);
        }
        List<Order> orders = orderRepository.findAllByStatusInWithItems(statuses);

        // Aggregate items by productId using insertion-ordered map
        Map<UUID, List<Object[]>> productMap = new java.util.LinkedHashMap<>();
        Map<UUID, String[]> productMeta = new java.util.LinkedHashMap<>();
        List<String> orderNumbers = new ArrayList<>();

        for (Order order : orders) {
            orderNumbers.add(order.getOrderNumber());
            String customerName = order.getCustomer() != null
                    ? order.getCustomer().getName() : order.getCustomerName();
            for (OrderItem item : order.getItems()) {
                UUID productId = item.getProduct().getId();
                productMeta.putIfAbsent(productId, new String[]{
                        item.getProductName(), item.getProduct().getSku()
                });
                productMap.computeIfAbsent(productId, k -> new ArrayList<>())
                        .add(new Object[]{order.getOrderNumber(), customerName, item.getQuantity()});
            }
        }

        List<br.com.centralmax.maxhub.order.dto.PurchaseListItemResponse> items = productMap.entrySet().stream()
                .map(e -> {
                    UUID pid = e.getKey();
                    String[] meta = productMeta.get(pid);
                    int total = e.getValue().stream().mapToInt(r -> (int) r[2]).sum();
                    List<br.com.centralmax.maxhub.order.dto.PurchaseListOrderRef> refs = e.getValue().stream()
                            .map(r -> new br.com.centralmax.maxhub.order.dto.PurchaseListOrderRef(
                                    (String) r[0], (String) r[1], (int) r[2]))
                            .toList();
                    return new br.com.centralmax.maxhub.order.dto.PurchaseListItemResponse(
                            pid, meta[0], meta[1], total, refs);
                })
                .toList();

        return new br.com.centralmax.maxhub.order.dto.PurchaseListResponse(
                java.time.Instant.now(), orderNumbers, items);
    }

    @Transactional(readOnly = true)
    public br.com.centralmax.maxhub.order.dto.DeliveryRouteResponse getDeliveryRoute(
            java.time.LocalDate date, List<OrderStatus> statuses) {
        if (statuses == null || statuses.isEmpty()) {
            statuses = List.of(OrderStatus.SAIU_ENTREGA);
        }
        if (date == null) {
            date = java.time.LocalDate.now();
        }
        java.time.Instant start = date.atStartOfDay(java.time.ZoneOffset.UTC).toInstant();
        java.time.Instant end = date.plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant();

        List<Order> orders = orderRepository.findDeliveryOrders(statuses, start, end);

        List<br.com.centralmax.maxhub.order.dto.DeliveryRouteStop> stops = new ArrayList<>();
        for (Order order : orders) {
            br.com.centralmax.maxhub.customer.Customer c = order.getCustomer();
            String address = null;
            String fullAddress = null;

            if (c != null && c.getAddressStreet() != null && !c.getAddressStreet().isBlank()) {
                String city = (c.getAddressCity() != null && !c.getAddressCity().isBlank())
                        ? c.getAddressCity() : "São José do Rio Preto";
                String state = (c.getAddressState() != null && !c.getAddressState().isBlank())
                        ? c.getAddressState() : "SP";

                StringBuilder displaySb = new StringBuilder(c.getAddressStreet());
                if (c.getAddressNumber() != null) displaySb.append(", ").append(c.getAddressNumber());
                if (c.getAddressNeighborhood() != null) displaySb.append(" - ").append(c.getAddressNeighborhood());
                displaySb.append(", ").append(city).append("/").append(state);
                address = displaySb.toString();

                StringBuilder mapsSb = new StringBuilder(c.getAddressStreet());
                if (c.getAddressNumber() != null) mapsSb.append(", ").append(c.getAddressNumber());
                if (c.getAddressNeighborhood() != null) mapsSb.append(", ").append(c.getAddressNeighborhood());
                mapsSb.append(", ").append(city).append(", ").append(state);
                fullAddress = mapsSb.toString();
            } else if (c != null && c.getAddress() != null) {
                address = c.getAddress();
                fullAddress = c.getAddress();
            }

            String itemsSummary = order.getItems().stream()
                    .map(i -> i.getQuantity() + "x " + i.getProductName())
                    .collect(java.util.stream.Collectors.joining(", "));

            String phone = c != null ? c.getPhone() : order.getCustomerPhone();
            String name = c != null ? c.getName() : order.getCustomerName();
            String neighborhood = c != null ? c.getAddressNeighborhood() : null;

            stops.add(new br.com.centralmax.maxhub.order.dto.DeliveryRouteStop(
                    order.getOrderNumber(), name, phone, address, fullAddress, itemsSummary, neighborhood));
        }

        String googleMapsUrl = buildGoogleMapsUrl(stops);
        return new br.com.centralmax.maxhub.order.dto.DeliveryRouteResponse(date, stops, googleMapsUrl);
    }

    private String buildGoogleMapsUrl(
            List<br.com.centralmax.maxhub.order.dto.DeliveryRouteStop> stops) {
        List<String> addresses = stops.stream()
                .filter(s -> s.fullAddress() != null)
                .map(br.com.centralmax.maxhub.order.dto.DeliveryRouteStop::fullAddress)
                .toList();
        if (addresses.isEmpty()) return null;

        String origin = "São José do Rio Preto, SP";
        String destination = encode(addresses.get(addresses.size() - 1));

        StringBuilder sb = new StringBuilder("https://www.google.com/maps/dir/?api=1");
        sb.append("&origin=").append(encode(origin));
        sb.append("&destination=").append(destination);
        if (addresses.size() > 1) {
            String waypoints = addresses.subList(0, addresses.size() - 1).stream()
                    .map(this::encode)
                    .collect(java.util.stream.Collectors.joining("|"));
            sb.append("&waypoints=").append(waypoints);
        }
        sb.append("&travelmode=driving");
        return sb.toString();
    }

    private String encode(String s) {
        return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8);
    }

    private LocalDate calculateDueDate(PaymentCondition condition) {
        if (condition == null) return null;
        LocalDate today = LocalDate.now();
        return switch (condition) {
            case A_VISTA -> today;
            case NA_ENTREGA -> null;
            case TRINTA_DIAS -> today.plusDays(30);
            case SESSENTA_DIAS -> today.plusDays(60);
            case NOVENTA_DIAS -> today.plusDays(90);
        };
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
