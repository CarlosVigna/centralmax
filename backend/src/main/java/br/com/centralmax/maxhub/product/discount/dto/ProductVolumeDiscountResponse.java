package br.com.centralmax.maxhub.product.discount.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductVolumeDiscountResponse(
        UUID id,
        Integer minQuantity,
        BigDecimal discountPercent,
        Instant createdAt
) {}
