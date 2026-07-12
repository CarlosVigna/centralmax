package br.com.centralmax.maxhub.product.history.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductPriceHistoryResponse(
        UUID id,
        BigDecimal oldPurchasePrice,
        BigDecimal newPurchasePrice,
        BigDecimal oldPriceA,
        BigDecimal newPriceA,
        BigDecimal oldPriceB,
        BigDecimal newPriceB,
        BigDecimal oldPriceC,
        BigDecimal newPriceC,
        Instant changedAt
) {}
