package br.com.centralmax.maxhub.saleschannel.dto;

import br.com.centralmax.maxhub.saleschannel.FeeBase;
import br.com.centralmax.maxhub.saleschannel.ShippingResponsibility;

import java.math.BigDecimal;
import java.util.UUID;

public record SalesChannelResponse(
        UUID id,
        String name,
        BigDecimal fixedFee,
        BigDecimal variableFeePercent,
        FeeBase feeBase,
        String feeBaseLabel,
        ShippingResponsibility shippingResponsibility,
        String shippingResponsibilityLabel,
        String notes,
        boolean active
) {}
