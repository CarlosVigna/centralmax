package br.com.centralmax.maxhub.customer;

import br.com.centralmax.maxhub.customer.dto.CustomerResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "statusLabel", expression = "java(br.com.centralmax.maxhub.customer.dto.CustomerResponse.labelOf(customer.getStatus()))")
    @Mapping(target = "originLabel", expression = "java(br.com.centralmax.maxhub.customer.dto.CustomerResponse.labelOf(customer.getOrigin()))")
    CustomerResponse toResponse(Customer customer);
}
