package br.com.centralmax.maxhub.supplier.dto;

import java.util.UUID;

public record SupplierResponse(
        UUID id,
        String name,
        String document,
        String phone,
        String email
) {
}
