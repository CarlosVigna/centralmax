package br.com.centralmax.maxhub.financial.dto;

import br.com.centralmax.maxhub.financial.FinancialEntryType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FinancialEntryRequest(
        @NotNull FinancialEntryType type,
        @NotBlank String description,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotNull LocalDate dueDate,
        UUID orderId,
        String notes
) {}
