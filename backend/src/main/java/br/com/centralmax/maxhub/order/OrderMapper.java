package br.com.centralmax.maxhub.order;

import br.com.centralmax.maxhub.financial.FinancialEntry;
import br.com.centralmax.maxhub.financial.FinancialEntryStatus;
import br.com.centralmax.maxhub.order.dto.OrderItemResponse;
import br.com.centralmax.maxhub.order.dto.OrderResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerDisplayName",
            expression = "java(order.getCustomer() != null ? order.getCustomer().getName() : order.getCustomerName())")
    @Mapping(target = "customerDisplayPhone",
            expression = "java(order.getCustomer() != null ? order.getCustomer().getPhone() : order.getCustomerPhone())")
    @Mapping(target = "statusLabel",
            expression = "java(br.com.centralmax.maxhub.order.dto.OrderResponse.labelOf(order.getStatus()))")
    @Mapping(target = "paymentConditionLabel",
            expression = "java(order.getPaymentCondition() != null ? order.getPaymentCondition().getLabel() : null)")
    @Mapping(target = "financialStatus",
            expression = "java(resolveFinancialStatus(order.getFinancialEntries()))")
    OrderResponse toResponse(Order order);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "discountPercent",
            expression = "java(item.getDiscountPercent() != null ? item.getDiscountPercent() : java.math.BigDecimal.ZERO)")
    @Mapping(target = "finalUnitPrice",
            expression = "java(computeFinalUnitPrice(item))")
    OrderItemResponse toItemResponse(OrderItem item);

    default String resolveFinancialStatus(List<FinancialEntry> entries) {
        if (entries == null || entries.isEmpty()) return "SEM_TITULO";
        boolean hasPaid = entries.stream()
                .anyMatch(e -> e.getStatus() == FinancialEntryStatus.PAGO);
        if (hasPaid) return "PAGO";
        boolean isOverdue = entries.stream()
                .anyMatch(e -> e.getStatus() == FinancialEntryStatus.PENDENTE
                        && e.getDueDate() != null
                        && e.getDueDate().isBefore(LocalDate.now()));
        if (isOverdue) return "VENCIDO";
        return "PENDENTE";
    }

    default BigDecimal computeFinalUnitPrice(OrderItem item) {
        BigDecimal discount = item.getDiscountPercent() != null
                ? item.getDiscountPercent() : BigDecimal.ZERO;
        if (discount.compareTo(BigDecimal.ZERO) == 0) return item.getUnitPrice();
        BigDecimal factor = BigDecimal.ONE.subtract(
                discount.divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP));
        return item.getUnitPrice().multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }
}
