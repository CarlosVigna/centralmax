package br.com.centralmax.maxhub.order.dto;

public record PurchaseListOrderRef(
        String orderNumber,
        String customerName,
        int quantity
) {}
