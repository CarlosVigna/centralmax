package br.com.centralmax.maxhub.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductRequest(
        @NotBlank @Size(min = 3, max = 160) String name,
        String description,
        @NotNull UUID categoryId,
        UUID supplierId,
        @Size(max = 50) String sku,
        @Positive BigDecimal purchasePrice,
        @Min(1) Integer minQuantity,
        @NotNull @Positive BigDecimal priceA,
        @NotNull @Positive BigDecimal priceB,
        @NotNull @Positive BigDecimal priceC,
        @Size(max = 500) String mainImageUrl
) {
}
