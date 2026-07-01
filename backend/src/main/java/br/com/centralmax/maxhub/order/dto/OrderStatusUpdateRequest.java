package br.com.centralmax.maxhub.order.dto;

import br.com.centralmax.maxhub.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(
        @NotNull(message = "Status é obrigatório")
        OrderStatus status
) {}
