package br.com.centralmax.maxhub.product.dto;

import br.com.centralmax.maxhub.product.ProductStatus;
import br.com.centralmax.maxhub.product.photo.dto.ProductPhotoResponse;
import br.com.centralmax.maxhub.product.variation.dto.ProductVariationResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductDetailResponse(
        UUID id,
        String name,
        String description,
        UUID categoryId,
        String categoryName,
        String mainImageUrl,
        BigDecimal displayPrice,
        ProductStatus status,
        List<ProductPhotoResponse> photos,
        List<ProductVariationResponse> variations
) {}
