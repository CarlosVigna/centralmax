package br.com.centralmax.maxhub.crm.dto;

import br.com.centralmax.maxhub.crm.ContactResult;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CompleteScheduleRequest(
        String notes,
        @NotNull(message = "Resultado do contato é obrigatório")
        ContactResult result,
        LocalDate rescheduledTo
) {}
