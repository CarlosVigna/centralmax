package br.com.centralmax.maxhub.supplier.dto;

import jakarta.validation.constraints.NotBlank;

public record SupplierRequest(
        @NotBlank String name,
        String contactName,
        String email,
        String phone,
        String notes
) {}
