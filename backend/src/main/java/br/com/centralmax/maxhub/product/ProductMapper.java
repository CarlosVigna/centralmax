package br.com.centralmax.maxhub.product;

import br.com.centralmax.maxhub.product.dto.ProductAdminResponse;
import br.com.centralmax.maxhub.product.dto.ProductDetailResponse;
import br.com.centralmax.maxhub.product.dto.ProductSummaryResponse;
import br.com.centralmax.maxhub.product.photo.ProductPhotoMapper;
import br.com.centralmax.maxhub.product.variation.ProductVariationMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ProductPhotoMapper.class, ProductVariationMapper.class})
public interface ProductMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "displayPrice", source = "priceC")
    ProductSummaryResponse toSummary(Product product);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "displayPrice", source = "priceC")
    @Mapping(target = "photos", source = "photos")
    @Mapping(target = "variations", source = "variations")
    ProductDetailResponse toDetail(Product product);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "photos", source = "photos")
    @Mapping(target = "variations", source = "variations")
    ProductAdminResponse toAdminResponse(Product product);
}
