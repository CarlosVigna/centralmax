package br.com.centralmax.maxhub.product.photo.dto;

import java.util.UUID;

public record ProductPhotoResponse(
        UUID id,
        String url,
        boolean isPrimary,
        int order
) {}
