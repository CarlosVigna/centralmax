package br.com.centralmax.maxhub.saleschannel;

import br.com.centralmax.maxhub.saleschannel.dto.SalesChannelResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SalesChannelMapper {

    @Mapping(target = "feeBaseLabel", expression = "java(channel.getFeeBase() != null ? channel.getFeeBase().getLabel() : null)")
    @Mapping(target = "shippingResponsibilityLabel",
            expression = "java(channel.getShippingResponsibility() != null ? channel.getShippingResponsibility().getLabel() : null)")
    SalesChannelResponse toResponse(SalesChannel channel);
}
