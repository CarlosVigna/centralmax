package br.com.centralmax.maxhub.product;

import br.com.centralmax.maxhub.category.Category;
import br.com.centralmax.maxhub.category.CategoryRepository;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.common.response.PageResponse;
import br.com.centralmax.maxhub.product.dto.ProductAdminResponse;
import br.com.centralmax.maxhub.product.dto.ProductDetailResponse;
import br.com.centralmax.maxhub.product.dto.ProductImportResult;
import br.com.centralmax.maxhub.product.dto.ProductRequest;
import br.com.centralmax.maxhub.product.dto.ProductSummaryResponse;
import br.com.centralmax.maxhub.product.history.ProductPriceHistory;
import br.com.centralmax.maxhub.product.history.ProductPriceHistoryRepository;
import br.com.centralmax.maxhub.product.history.dto.ProductPriceHistoryResponse;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductPhotoRepository photoRepository;
    private final ProductVariationRepository variationRepository;
    private final ProductPriceHistoryRepository priceHistoryRepository;
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
                .sku(request.sku())
                .purchasePrice(request.purchasePrice())
                .minQuantity(request.minQuantity() != null ? request.minQuantity() : 1)
                .priceA(request.priceA())
                .priceB(request.priceB())
                .priceC(request.priceC())
                .maxDiscountPercent(request.maxDiscountPercent() != null
                        ? request.maxDiscountPercent() : new java.math.BigDecimal("100"))
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

        boolean priceChanged =
                !Objects.equals(product.getPurchasePrice(), request.purchasePrice()) ||
                !Objects.equals(product.getPriceA(), request.priceA()) ||
                !Objects.equals(product.getPriceB(), request.priceB()) ||
                !Objects.equals(product.getPriceC(), request.priceC());

        if (priceChanged) {
            priceHistoryRepository.save(ProductPriceHistory.builder()
                    .product(product)
                    .oldPurchasePrice(product.getPurchasePrice())
                    .newPurchasePrice(request.purchasePrice())
                    .oldPriceA(product.getPriceA())
                    .newPriceA(request.priceA())
                    .oldPriceB(product.getPriceB())
                    .newPriceB(request.priceB())
                    .oldPriceC(product.getPriceC())
                    .newPriceC(request.priceC())
                    .build());
        }

        product.setName(request.name());
        product.setDescription(request.description());
        product.setCategory(category);
        product.setSupplier(supplier);
        product.setSku(request.sku());
        product.setPurchasePrice(request.purchasePrice());
        if (request.minQuantity() != null) product.setMinQuantity(request.minQuantity());
        product.setPriceA(request.priceA());
        product.setPriceB(request.priceB());
        product.setPriceC(request.priceC());
        if (request.maxDiscountPercent() != null) product.setMaxDiscountPercent(request.maxDiscountPercent());
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
                .purchasePrice(original.getPurchasePrice())
                .minQuantity(original.getMinQuantity())
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

        entityManager.flush();
        entityManager.refresh(copy);

        return productMapper.toAdminResponse(copy);
    }

    @Transactional(readOnly = true)
    public List<ProductPriceHistoryResponse> getPriceHistory(UUID id) {
        findOrThrow(id);
        Pageable top10 = PageRequest.of(0, 10);
        return priceHistoryRepository.findByProductIdOrderByChangedAtDesc(id, top10)
                .stream()
                .map(h -> new ProductPriceHistoryResponse(
                        h.getId(),
                        h.getOldPurchasePrice(), h.getNewPurchasePrice(),
                        h.getOldPriceA(), h.getNewPriceA(),
                        h.getOldPriceB(), h.getNewPriceB(),
                        h.getOldPriceC(), h.getNewPriceC(),
                        h.getChangedAt()))
                .toList();
    }

    @Transactional
    public ProductImportResult importCsv(MultipartFile file) {
        List<ProductImportResult.LineError> errors = new ArrayList<>();
        int created = 0;
        int updated = 0;
        int lineNum = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String header = reader.readLine();
            if (header == null) {
                return new ProductImportResult(0, 0, 0, List.of(
                        new ProductImportResult.LineError(0, "Arquivo vazio")));
            }

            String line;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                if (line.isBlank()) continue;
                try {
                    String[] cols = parseCsvLine(line);
                    if (cols.length < 9) {
                        errors.add(new ProductImportResult.LineError(lineNum, "Número de colunas insuficiente"));
                        continue;
                    }

                    String sku         = cols[0].trim();
                    String nome        = cols[1].trim();
                    String descricao   = cols[2].trim();
                    String catNome     = cols[3].trim();
                    String fornNome    = cols[4].trim();
                    String precoCusto  = cols[5].trim();
                    String precoA      = cols[6].trim();
                    String precoB      = cols[7].trim();
                    String precoC      = cols[8].trim();
                    String qtdMin      = cols.length > 9 ? cols[9].trim() : "1";

                    if (nome.isEmpty()) {
                        errors.add(new ProductImportResult.LineError(lineNum, "Nome obrigatório"));
                        continue;
                    }
                    if (precoA.isEmpty() || precoB.isEmpty() || precoC.isEmpty()) {
                        errors.add(new ProductImportResult.LineError(lineNum, "Preços A, B e C são obrigatórios"));
                        continue;
                    }

                    BigDecimal bPrecoA = parseBigDecimal(precoA);
                    BigDecimal bPrecoB = parseBigDecimal(precoB);
                    BigDecimal bPrecoC = parseBigDecimal(precoC);

                    if (bPrecoA == null || bPrecoB == null || bPrecoC == null) {
                        errors.add(new ProductImportResult.LineError(lineNum, "Preço inválido"));
                        continue;
                    }

                    Category category = resolveOrCreateCategory(catNome);
                    Supplier supplier = resolveOrCreateSupplier(fornNome);

                    BigDecimal bCusto = precoCusto.isEmpty() ? null : parseBigDecimal(precoCusto);
                    int minQtd = qtdMin.isEmpty() ? 1 : Integer.parseInt(qtdMin);

                    if (!sku.isEmpty()) {
                        var existing = productRepository.findBySku(sku);
                        if (existing.isPresent()) {
                            Product p = existing.get();
                            p.setName(nome);
                            if (!descricao.isEmpty()) p.setDescription(descricao);
                            p.setCategory(category);
                            if (supplier != null) p.setSupplier(supplier);
                            if (bCusto != null) p.setPurchasePrice(bCusto);
                            p.setPriceA(bPrecoA);
                            p.setPriceB(bPrecoB);
                            p.setPriceC(bPrecoC);
                            p.setMinQuantity(minQtd);
                            productRepository.save(p);
                            updated++;
                            continue;
                        }
                    }

                    Product p = Product.builder()
                            .name(nome)
                            .description(descricao.isEmpty() ? null : descricao)
                            .sku(sku.isEmpty() ? null : sku)
                            .category(category)
                            .supplier(supplier)
                            .purchasePrice(bCusto)
                            .priceA(bPrecoA)
                            .priceB(bPrecoB)
                            .priceC(bPrecoC)
                            .minQuantity(minQtd)
                            .status(ProductStatus.ATIVO)
                            .build();
                    productRepository.save(p);
                    created++;

                } catch (Exception e) {
                    errors.add(new ProductImportResult.LineError(lineNum, e.getMessage()));
                }
            }
        } catch (Exception e) {
            errors.add(new ProductImportResult.LineError(0, "Erro ao ler arquivo: " + e.getMessage()));
        }

        return new ProductImportResult(created + updated + errors.size(), created, updated, errors);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private Category resolveOrCreateCategory(String name) {
        if (name == null || name.isBlank()) {
            return categoryRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Nenhuma categoria disponível"));
        }
        return categoryRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            String slug = name.toLowerCase()
                    .replaceAll("[^a-z0-9\\s]+", "")
                    .trim()
                    .replaceAll("\\s+", "-");
            return categoryRepository.save(Category.builder()
                    .name(name)
                    .slug(slug)
                    .active(true)
                    .build());
        });
    }

    private Supplier resolveOrCreateSupplier(String name) {
        if (name == null || name.isBlank()) return null;
        return supplierRepository.findByNameIgnoreCase(name).orElseGet(() ->
                supplierRepository.save(Supplier.builder()
                        .name(name)
                        .active(true)
                        .build()));
    }

    private BigDecimal parseBigDecimal(String value) {
        try {
            return new BigDecimal(value.replace(",", "."));
        } catch (Exception e) {
            return null;
        }
    }

    private String[] parseCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    sb.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                tokens.add(sb.toString());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString());
        return tokens.toArray(new String[0]);
    }

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
        if (supplierId == null) return null;
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
