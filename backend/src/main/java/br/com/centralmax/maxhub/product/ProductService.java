package br.com.centralmax.maxhub.product;

import br.com.centralmax.maxhub.category.Category;
import br.com.centralmax.maxhub.category.CategoryRepository;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.common.response.PageResponse;
import br.com.centralmax.maxhub.product.dto.ProductAdminResponse;
import br.com.centralmax.maxhub.product.dto.ProductDetailResponse;
import br.com.centralmax.maxhub.product.dto.ProductRequest;
import br.com.centralmax.maxhub.product.dto.ProductSummaryResponse;
import br.com.centralmax.maxhub.supplier.Supplier;
import br.com.centralmax.maxhub.supplier.SupplierRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> list(UUID categoryId, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> result = productRepository.findAll(buildActiveSpec(categoryId, search), pageable);
        return PageResponse.from(result.map(productMapper::toSummary));
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getById(UUID id) {
        return productMapper.toDetail(findOrThrow(id));
    }

    @Transactional
    public ProductAdminResponse create(ProductRequest request) {
        Category category = findCategoryOrThrow(request.categoryId());
        Supplier supplier = resolveSupplier(request.supplierId());

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .category(category)
                .supplier(supplier)
                .priceA(request.priceA())
                .priceB(request.priceB())
                .priceC(request.priceC())
                .mainImageUrl(request.mainImageUrl())
                .status(ProductStatus.ATIVO)
                .build();

        return productMapper.toAdminResponse(productRepository.save(product));
    }

    @Transactional
    public ProductAdminResponse update(UUID id, ProductRequest request) {
        Product product = findOrThrow(id);
        Category category = findCategoryOrThrow(request.categoryId());
        Supplier supplier = resolveSupplier(request.supplierId());

        product.setName(request.name());
        product.setDescription(request.description());
        product.setCategory(category);
        product.setSupplier(supplier);
        product.setPriceA(request.priceA());
        product.setPriceB(request.priceB());
        product.setPriceC(request.priceC());
        product.setMainImageUrl(request.mainImageUrl());

        return productMapper.toAdminResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(UUID id) {
        Product product = findOrThrow(id);
        product.setStatus(ProductStatus.INATIVO);
        productRepository.save(product);
    }

    private Category findCategoryOrThrow(UUID categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }

    private Supplier resolveSupplier(UUID supplierId) {
        if (supplierId == null) {
            return null;
        }
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado"));
    }

    private Product findOrThrow(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));
    }

    private Specification<Product> buildActiveSpec(UUID categoryId, String search) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("status"), ProductStatus.ATIVO));

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }
            if (search != null && !search.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
