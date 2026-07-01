package br.com.centralmax.maxhub.product.dto;

import br.com.centralmax.maxhub.product.ProductStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductAdminResponse(
        UUID id,
        String name,
        String description,
        UUID categoryId,
        String categoryName,
        UUID supplierId,
        BigDecimal priceA,
        BigDecimal priceB,
        BigDecimal priceC,
        String mainImageUrl,
        ProductStatus status
) {
}
