package br.com.centralmax.maxhub.order.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemRequest(
        @NotNull(message = "ID do produto é obrigatório")
        UUID productId,

        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade mínima é 1")
        Integer quantity,

        @DecimalMin(value = "0.0", message = "Desconto não pode ser negativo")
        @DecimalMax(value = "100.0", message = "Desconto máximo é 100%")
        BigDecimal discountPercent
) {}
