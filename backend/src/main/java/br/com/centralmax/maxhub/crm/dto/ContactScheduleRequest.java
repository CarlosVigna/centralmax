package br.com.centralmax.maxhub.crm.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ContactScheduleRequest(
        @NotNull(message = "Data é obrigatória")
        LocalDate scheduledDate,

        String reason
) {}
