package br.com.centralmax.maxhub.financial;

import br.com.centralmax.maxhub.financial.dto.FinancialEntryRequest;
import br.com.centralmax.maxhub.financial.dto.FinancialEntryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FinancialEntryMapper {

    @Mapping(target = "type", expression = "java(entry.getType().name())")
    @Mapping(target = "typeLabel", expression = "java(entry.getType().getLabel())")
    @Mapping(target = "status", expression = "java(entry.getStatus().name())")
    @Mapping(target = "statusLabel", expression = "java(entry.getStatus().getLabel())")
    @Mapping(target = "orderId", expression = "java(entry.getOrder() != null ? entry.getOrder().getId() : null)")
    @Mapping(target = "orderNumber", expression = "java(entry.getOrder() != null ? entry.getOrder().getOrderNumber() : null)")
    FinancialEntryResponse toResponse(FinancialEntry entry);

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
}
