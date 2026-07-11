package br.com.centralmax.maxhub.order.dto;

import br.com.centralmax.maxhub.order.PaymentCondition;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record OrderRequest(
        UUID customerId,

        @Size(max = 160, message = "Nome deve ter no máximo 160 caracteres")
        String customerName,

        @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
        String customerPhone,

        @Size(max = 2000, message = "Observações devem ter no máximo 2000 caracteres")
        String notes,

        PaymentCondition paymentCondition,

        @Size(max = 50, message = "Número da NF deve ter no máximo 50 caracteres")
        String nfNumber,

        java.time.LocalDate estimatedDeliveryDate,

        @NotEmpty(message = "O pedido deve ter ao menos 1 item")
        @Valid
        List<OrderItemRequest> items
) {}
