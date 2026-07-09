package br.com.centralmax.maxhub.customer;

import br.com.centralmax.maxhub.customer.dto.CustomerResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "statusLabel",
            expression = "java(br.com.centralmax.maxhub.customer.dto.CustomerResponse.labelOf(customer.getStatus()))")
    @Mapping(target = "originLabel",
            expression = "java(br.com.centralmax.maxhub.customer.dto.CustomerResponse.labelOf(customer.getOrigin()))")
    @Mapping(target = "fullAddress", expression = "java(buildFullAddress(customer))")
    CustomerResponse toResponse(Customer customer);

    default String buildFullAddress(Customer customer) {
        if (customer.getAddressStreet() == null || customer.getAddressStreet().isBlank()) return null;
        StringBuilder sb = new StringBuilder(customer.getAddressStreet().trim());
        if (customer.getAddressNumber() != null && !customer.getAddressNumber().isBlank()) {
            sb.append(", ").append(customer.getAddressNumber().trim());
        }
        if (customer.getAddressNeighborhood() != null && !customer.getAddressNeighborhood().isBlank()) {
            sb.append(" - ").append(customer.getAddressNeighborhood().trim());
        }
        String city = (customer.getAddressCity() != null && !customer.getAddressCity().isBlank())
                ? customer.getAddressCity().trim() : "São José do Rio Preto";
        String state = (customer.getAddressState() != null && !customer.getAddressState().isBlank())
                ? customer.getAddressState().trim() : "SP";
        sb.append(", ").append(city).append("/").append(state);
        return sb.toString();
    }
}
