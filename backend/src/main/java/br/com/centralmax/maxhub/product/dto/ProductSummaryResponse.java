package br.com.centralmax.maxhub.product.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSummaryResponse(
        UUID id,
        String name,
        String description,
        UUID categoryId,
        String categoryName,
        String mainImageUrl,
        BigDecimal displayPrice,
        Integer minQuantity
) {
}
