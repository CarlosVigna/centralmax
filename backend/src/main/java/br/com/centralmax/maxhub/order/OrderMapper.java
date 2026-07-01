package br.com.centralmax.maxhub.order;

import br.com.centralmax.maxhub.order.dto.OrderItemResponse;
import br.com.centralmax.maxhub.order.dto.OrderResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerDisplayName",
            expression = "java(order.getCustomer() != null ? order.getCustomer().getName() : order.getCustomerName())")
    @Mapping(target = "customerDisplayPhone",
            expression = "java(order.getCustomer() != null ? order.getCustomer().getPhone() : order.getCustomerPhone())")
    @Mapping(target = "statusLabel",
            expression = "java(br.com.centralmax.maxhub.order.dto.OrderResponse.labelOf(order.getStatus()))")
    OrderResponse toResponse(Order order);

    @Mapping(target = "productId", source = "product.id")
    OrderItemResponse toItemResponse(OrderItem item);
}
