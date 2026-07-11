package br.com.centralmax.maxhub.order.dto;

public record DeliveryRouteStop(
        String orderNumber,
        String customerName,
        String phone,
        String address,
        String fullAddress,
        String items,
        String neighborhood
) {}
