package br.com.centralmax.maxhub.financial.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record FinancialEntryResponse(
        UUID id,
        String type,
        String typeLabel,
        String status,
        String statusLabel,
        String description,
        BigDecimal amount,
        LocalDate dueDate,
        Instant paidAt,
        UUID orderId,
        String orderNumber,
        String notes,
        Instant createdAt
) {}
