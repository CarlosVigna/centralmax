package br.com.centralmax.maxhub.product.photo;

import br.com.centralmax.maxhub.product.photo.dto.ProductPhotoResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductPhotoMapper {

    @Mapping(target = "isPrimary", source = "primary")
    @Mapping(target = "order", source = "displayOrder")
    ProductPhotoResponse toResponse(ProductPhoto photo);
}
