package br.com.centralmax.maxhub.customer;

import br.com.centralmax.maxhub.customer.dto.CustomerInteractionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerInteractionMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.name")
    @Mapping(target = "type", expression = "java(interaction.getType().name())")
    CustomerInteractionResponse toResponse(CustomerInteraction interaction);
}
