package br.com.centralmax.maxhub.goals.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SalesGoalResponse(
        UUID id,
        LocalDate month,
        BigDecimal targetAmount,
        Instant createdAt
) {}
