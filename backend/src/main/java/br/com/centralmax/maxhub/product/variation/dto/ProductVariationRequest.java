package br.com.centralmax.maxhub.product.variation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductVariationRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 100) String value
) {}
