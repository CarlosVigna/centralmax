package br.com.centralmax.maxhub.order.dto;

import java.time.Instant;
import java.util.List;

public record PurchaseListResponse(
        Instant generatedAt,
        List<String> orders,
        List<PurchaseListItemResponse> items
) {}
