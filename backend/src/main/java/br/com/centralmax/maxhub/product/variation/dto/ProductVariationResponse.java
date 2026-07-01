package br.com.centralmax.maxhub.product.variation.dto;

import java.util.UUID;

public record ProductVariationResponse(
        UUID id,
        String name,
        String value
) {}
