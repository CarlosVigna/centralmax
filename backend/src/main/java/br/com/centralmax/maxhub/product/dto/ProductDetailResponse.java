package br.com.centralmax.maxhub.product.dto;

import br.com.centralmax.maxhub.product.ProductStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductDetailResponse(
        UUID id,
        String name,
        String description,
        UUID categoryId,
        String categoryName,
        String mainImageUrl,
        BigDecimal displayPrice,
        ProductStatus status
) {
}
