package br.com.centralmax.maxhub.product.discount.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductVolumeDiscountRequest(
        @NotNull(message = "Quantidade mínima é obrigatória")
        @Min(value = 1, message = "Quantidade mínima deve ser pelo menos 1")
        Integer minQuantity,

        @NotNull(message = "Percentual de desconto é obrigatório")
        @DecimalMin(value = "0.01", message = "Desconto deve ser positivo")
        @DecimalMax(value = "100.00", message = "Desconto não pode exceder 100%")
        BigDecimal discountPercent
) {}
