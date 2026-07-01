package br.com.centralmax.maxhub.product.variation;

import br.com.centralmax.maxhub.product.variation.dto.ProductVariationResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductVariationMapper {

    ProductVariationResponse toResponse(ProductVariation variation);
}
