package br.com.centralmax.maxhub.supplier.dto;

import java.time.Instant;
import java.util.UUID;

public record SupplierResponse(
        UUID id,
        String name,
        String contactName,
        String document,
        String phone,
        String email,
        String notes,
        boolean active,
        Instant createdAt
) {}
