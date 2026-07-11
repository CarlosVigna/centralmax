package br.com.centralmax.maxhub.customer;

import br.com.centralmax.maxhub.customer.dto.CustomerResponse;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "statusLabel",
            expression = "java(br.com.centralmax.maxhub.customer.dto.CustomerResponse.labelOf(customer.getStatus()))")
    @Mapping(target = "originLabel",
            expression = "java(br.com.centralmax.maxhub.customer.dto.CustomerResponse.labelOf(customer.getOrigin()))")
    @Mapping(target = "fullAddress", expression = "java(buildFullAddress(customer))")
    @Mapping(target = "cadenceLabel", expression = "java(buildCadenceLabel(customer))")
    @Mapping(target = "isContactDue", expression = "java(isContactDue(customer))")
    @Mapping(target = "prospectStatusLabel",
            expression = "java(br.com.centralmax.maxhub.customer.dto.CustomerResponse.labelOf(customer.getProspectStatus()))")
    @Mapping(target = "favoriteProducts", ignore = true)
    @Mapping(target = "overdueAmount", expression = "java(java.math.BigDecimal.ZERO)")
    @Mapping(target = "overdueCount", expression = "java(0)")
    CustomerResponse toResponse(Customer customer);

    default CustomerResponse toResponseWithFavorites(Customer customer, List<String> favorites,
            java.math.BigDecimal overdueAmount, int overdueCount) {
        CustomerResponse base = toResponse(customer);
        return new CustomerResponse(
                base.id(), base.name(), base.email(), base.phone(), base.document(),
                base.status(), base.statusLabel(), base.customerType(), base.origin(), base.originLabel(),
                base.notes(), base.addressStreet(), base.addressNumber(), base.addressComplement(),
                base.addressNeighborhood(), base.addressCity(), base.addressState(), base.addressZip(),
                base.fullAddress(), base.contactCadenceDays(), base.nextContactDate(),
                base.lastContactedAt(), base.cadenceLabel(), base.isContactDue(),
                base.commercialPotential(), base.commercialNotes(), base.businessType(),
                base.prospectStatus(), base.prospectStatusLabel(), base.lostReason(),
                base.averageTicket(), base.totalPurchased(), base.lastPurchaseDate(),
                overdueAmount,
                overdueCount,
                favorites,
                base.createdAt(), base.updatedAt()
        );
    }

    default String buildCadenceLabel(Customer customer) {
        if (customer.getContactCadenceDays() == null) return null;
        int days = customer.getContactCadenceDays();
        return "A cada " + days + " dia" + (days == 1 ? "" : "s");
    }

    default boolean isContactDue(Customer customer) {
        if (customer.getNextContactDate() == null) return false;
        return !customer.getNextContactDate().isAfter(java.time.LocalDate.now());
    }

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
