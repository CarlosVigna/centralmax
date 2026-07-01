package br.com.centralmax.maxhub.customer.dto;

import java.time.Instant;
import java.util.UUID;

public record CustomerInteractionResponse(
        UUID id,
        UUID customerId,
        String customerName,
        String type,
        String notes,
        Instant scheduledAt,
        Instant completedAt,
        Instant createdAt
) {}
