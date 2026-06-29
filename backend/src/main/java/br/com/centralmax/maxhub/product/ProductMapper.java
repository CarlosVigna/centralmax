package br.com.centralmax.maxhub.product;

import br.com.centralmax.maxhub.product.dto.ProductAdminResponse;
import br.com.centralmax.maxhub.product.dto.ProductDetailResponse;
import br.com.centralmax.maxhub.product.dto.ProductSummaryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "displayPrice", source = "priceC")
    ProductSummaryResponse toSummary(Product product);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "displayPrice", source = "priceC")
    ProductDetailResponse toDetail(Product product);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "supplierId", source = "supplier.id")
    ProductAdminResponse toAdminResponse(Product product);
}
