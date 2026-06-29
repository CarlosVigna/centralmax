package br.com.centralmax.maxhub.category;

import br.com.centralmax.maxhub.category.dto.CategoryResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryResponse toResponse(Category category);
}
