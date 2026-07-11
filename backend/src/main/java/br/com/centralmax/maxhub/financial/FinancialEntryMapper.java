package br.com.centralmax.maxhub.financial;

import br.com.centralmax.maxhub.financial.dto.FinancialEntryRequest;
import br.com.centralmax.maxhub.financial.dto.FinancialEntryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.time.LocalDate;

@Mapper(componentModel = "spring")
public interface FinancialEntryMapper {

    @Mapping(target = "type", expression = "java(entry.getType().name())")
    @Mapping(target = "typeLabel", expression = "java(entry.getType().getLabel())")
    @Mapping(target = "status", expression = "java(resolveEffectiveStatus(entry))")
    @Mapping(target = "statusLabel", expression = "java(resolveEffectiveStatusLabel(entry))")
    @Mapping(target = "orderId", expression = "java(entry.getOrder() != null ? entry.getOrder().getId() : null)")
    @Mapping(target = "orderNumber", expression = "java(entry.getOrder() != null ? entry.getOrder().getOrderNumber() : null)")
    @Mapping(target = "customerName", expression = "java(resolveCustomerName(entry))")
    @Mapping(target = "customerPhone", expression = "java(resolveCustomerPhone(entry))")
    FinancialEntryResponse toResponse(FinancialEntry entry);

    default String resolveCustomerName(FinancialEntry entry) {
        if (entry.getOrder() == null) return null;
        br.com.centralmax.maxhub.order.Order o = entry.getOrder();
        return o.getCustomer() != null ? o.getCustomer().getName() : o.getCustomerName();
    }

    default String resolveCustomerPhone(FinancialEntry entry) {
        if (entry.getOrder() == null) return null;
        br.com.centralmax.maxhub.order.Order o = entry.getOrder();
        return o.getCustomer() != null ? o.getCustomer().getPhone() : o.getCustomerPhone();
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "paidAt", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    FinancialEntry toEntity(FinancialEntryRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "paidAt", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(FinancialEntryRequest request, @MappingTarget FinancialEntry entry);

    default String resolveEffectiveStatus(FinancialEntry entry) {
        if (entry.getStatus() == FinancialEntryStatus.PENDENTE
                && entry.getDueDate() != null
                && entry.getDueDate().isBefore(LocalDate.now())) {
            return "VENCIDO";
        }
        return entry.getStatus().name();
    }

    default String resolveEffectiveStatusLabel(FinancialEntry entry) {
        if (entry.getStatus() == FinancialEntryStatus.PENDENTE
                && entry.getDueDate() != null
                && entry.getDueDate().isBefore(LocalDate.now())) {
            return "Vencido";
        }
        return entry.getStatus().getLabel();
    }
}
