package br.com.centralmax.maxhub.product.photo.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

public record PhotoReorderRequest(
        @NotEmpty List<UUID> order
) {}
