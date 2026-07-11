package br.com.centralmax.maxhub.goals.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalesGoalRequest(
        @NotNull LocalDate month,
        @NotNull @Positive BigDecimal targetAmount
) {}
