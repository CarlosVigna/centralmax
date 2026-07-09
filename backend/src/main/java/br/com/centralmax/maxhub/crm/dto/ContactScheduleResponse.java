package br.com.centralmax.maxhub.crm.dto;

import br.com.centralmax.maxhub.crm.ContactScheduleStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ContactScheduleResponse(
        UUID id,
        UUID customerId,
        String customerName,
        String customerPhone,
        String customerStatus,
        LocalDate scheduledDate,
        String reason,
        ContactScheduleStatus status,
        String notes,
        Instant completedAt,
        Instant createdAt,
        LocalDate nextContactDate
) {}
