package br.com.centralmax.maxhub.order.dto;

import br.com.centralmax.maxhub.order.OrderStatus;
import br.com.centralmax.maxhub.order.PaymentCondition;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderNumber,
        UUID customerId,
        String customerDisplayName,
        String customerDisplayPhone,
        OrderStatus status,
        String statusLabel,
        PaymentCondition paymentCondition,
        String paymentConditionLabel,
        LocalDate dueDate,
        String financialStatus,
        String notes,
        BigDecimal totalAmount,
        List<OrderItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {

    public static String labelOf(OrderStatus status) {
        return switch (status) {
            case NOVO -> "Novo";
            case CONFIRMADO -> "Confirmado";
            case EM_SEPARACAO -> "Em Separação";
            case SAIU_ENTREGA -> "Saiu p/ Entrega";
            case ENTREGUE -> "Entregue";
            case CONCLUIDO -> "Concluído";
            case CANCELADO -> "Cancelado";
        };
    }

    public static OrderStatus nextStatus(OrderStatus current) {
        return switch (current) {
            case NOVO -> OrderStatus.CONFIRMADO;
            case CONFIRMADO -> OrderStatus.EM_SEPARACAO;
            case EM_SEPARACAO -> OrderStatus.SAIU_ENTREGA;
            case SAIU_ENTREGA -> OrderStatus.ENTREGUE;
            case ENTREGUE -> OrderStatus.CONCLUIDO;
            default -> null;
        };
    }
}
