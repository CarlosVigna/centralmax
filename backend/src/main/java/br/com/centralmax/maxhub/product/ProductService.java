package br.com.centralmax.maxhub.product;

import br.com.centralmax.maxhub.category.Category;
import br.com.centralmax.maxhub.category.CategoryRepository;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.common.response.PageResponse;
import br.com.centralmax.maxhub.product.dto.ProductAdminResponse;
import br.com.centralmax.maxhub.product.dto.ProductDetailResponse;
import br.com.centralmax.maxhub.product.dto.ProductRequest;
import br.com.centralmax.maxhub.product.dto.ProductSummaryResponse;
import br.com.centralmax.maxhub.product.photo.ProductPhoto;
import br.com.centralmax.maxhub.product.photo.ProductPhotoRepository;
import br.com.centralmax.maxhub.product.variation.ProductVariation;
import br.com.centralmax.maxhub.product.variation.ProductVariationRepository;
import br.com.centralmax.maxhub.supplier.Supplier;
import br.com.centralmax.maxhub.supplier.SupplierRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
    private final ProductPhotoRepository photoRepository;
    private final ProductVariationRepository variationRepository;
    private final ProductMapper productMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> list(UUID categoryId, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> result = productRepository.findAll(buildActiveSpec(categoryId, search), pageable);
        return PageResponse.from(result.map(productMapper::toSummary));
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductAdminResponse> listAdmin(UUID categoryId, String search, ProductStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> result = productRepository.findAll(buildAdminSpec(categoryId, search, status), pageable);
        return PageResponse.from(result.map(productMapper::toAdminResponse));
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getById(UUID id) {
        return productMapper.toDetail(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public ProductAdminResponse getByIdAdmin(UUID id) {
        return productMapper.toAdminResponse(findOrThrow(id));
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

    @Transactional
    public ProductAdminResponse activate(UUID id) {
        Product product = findOrThrow(id);
        product.setStatus(ProductStatus.ATIVO);
        return productMapper.toAdminResponse(productRepository.save(product));
    }

    @Transactional
    public ProductAdminResponse duplicate(UUID id, boolean copyPhotos) {
        Product original = findOrThrow(id);

        Product copy = Product.builder()
                .name("Cópia de " + original.getName())
                .description(original.getDescription())
                .category(original.getCategory())
                .supplier(original.getSupplier())
                .priceA(original.getPriceA())
                .priceB(original.getPriceB())
                .priceC(original.getPriceC())
                .mainImageUrl(original.getMainImageUrl())
                .status(ProductStatus.INATIVO)
                .build();

        copy = productRepository.save(copy);

        if (copyPhotos) {
            copyPhotos(original, copy);
        }

        List<ProductVariation> sourceVariations =
                variationRepository.findByProductIdAndActiveTrueOrderByCreatedAtAsc(original.getId());

        final Product savedCopy = copy;
        List<ProductVariation> copiedVariations = sourceVariations.stream()
                .map(v -> ProductVariation.builder()
                        .product(savedCopy)
                        .name(v.getName())
                        .value(v.getValue())
                        .build())
                .toList();

        variationRepository.saveAll(copiedVariations);

        // Flush to DB and evict from L1 cache so the re-fetch includes the new variations
        entityManager.flush();
        entityManager.refresh(copy);

        return productMapper.toAdminResponse(copy);
    }

    // Cria novos registros de foto apontando para os mesmos objetos do R2.
    // O objeto de storage é compartilhado entre original e cópia; excluir a foto
    // de um produto pode tornar a URL da outra inválida — limitação conhecida do
    // StorageService que não expõe CopyObject. Ver ADR 003.
    private void copyPhotos(Product original, Product copy) {
        List<ProductPhoto> sourcePhotos =
                photoRepository.findByProductIdOrderByDisplayOrderAsc(original.getId());

        List<ProductPhoto> newPhotos = new ArrayList<>();
        for (ProductPhoto src : sourcePhotos) {
            newPhotos.add(ProductPhoto.builder()
                    .product(copy)
                    .filename(src.getFilename())
                    .url(src.getUrl())
                    .primary(src.isPrimary())
                    .displayOrder(src.getDisplayOrder())
                    .build());
        }

        if (!newPhotos.isEmpty()) {
            photoRepository.saveAll(newPhotos);
            newPhotos.stream().filter(ProductPhoto::isPrimary).findFirst()
                    .ifPresent(p -> {
                        copy.setMainImageUrl(p.getUrl());
                        productRepository.save(copy);
                    });
        }
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

    private Specification<Product> buildAdminSpec(UUID categoryId, String search, ProductStatus status) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (search != null && !search.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
