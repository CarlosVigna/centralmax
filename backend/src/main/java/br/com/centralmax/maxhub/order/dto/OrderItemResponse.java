package br.com.centralmax.maxhub.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID id,
        UUID productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal discountPercent,
        BigDecimal finalUnitPrice,
        BigDecimal subtotal
) {}
