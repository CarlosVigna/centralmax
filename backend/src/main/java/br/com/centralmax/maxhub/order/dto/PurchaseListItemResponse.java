package br.com.centralmax.maxhub.order.dto;

import java.util.List;
import java.util.UUID;

public record PurchaseListItemResponse(
        UUID productId,
        String productName,
        String sku,
        int totalQuantity,
        List<PurchaseListOrderRef> orders
) {}
