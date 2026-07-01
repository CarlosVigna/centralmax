package br.com.centralmax.maxhub.customer.dto;

import br.com.centralmax.maxhub.customer.InteractionType;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CustomerInteractionRequest(
        @NotNull InteractionType type,
        String notes,
        Instant scheduledAt
) {}
