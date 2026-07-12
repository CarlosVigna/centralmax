package br.com.centralmax.maxhub.product;

import br.com.centralmax.maxhub.common.response.PageResponse;
import br.com.centralmax.maxhub.product.discount.ProductVolumeDiscountService;
import br.com.centralmax.maxhub.product.discount.dto.ProductVolumeDiscountRequest;
import br.com.centralmax.maxhub.product.discount.dto.ProductVolumeDiscountResponse;
import br.com.centralmax.maxhub.product.dto.ProductAdminResponse;
import br.com.centralmax.maxhub.product.dto.ProductDetailResponse;
import br.com.centralmax.maxhub.product.dto.ProductImportResult;
import br.com.centralmax.maxhub.product.dto.ProductRequest;
import br.com.centralmax.maxhub.product.dto.ProductSummaryResponse;
import br.com.centralmax.maxhub.product.history.dto.ProductPriceHistoryResponse;
import br.com.centralmax.maxhub.product.photo.ProductPhotoService;
import br.com.centralmax.maxhub.product.photo.dto.PhotoReorderRequest;
import br.com.centralmax.maxhub.product.photo.dto.ProductPhotoResponse;
import br.com.centralmax.maxhub.product.variation.ProductVariationService;
import br.com.centralmax.maxhub.product.variation.dto.ProductVariationRequest;
import br.com.centralmax.maxhub.product.variation.dto.ProductVariationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductPhotoService photoService;
    private final ProductVariationService variationService;
    private final ProductVolumeDiscountService discountService;

    // ── Product CRUD ────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<PageResponse<ProductSummaryResponse>> list(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.list(categoryId, search, page, size));
    }

    @GetMapping("/admin")
    public ResponseEntity<PageResponse<ProductAdminResponse>> listAdmin(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.listAdmin(categoryId, search, status, page, size));
    }

    @GetMapping("/{id}/admin")
    public ResponseEntity<ProductAdminResponse> getByIdAdmin(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getByIdAdmin(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ProductAdminResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductAdminResponse> update(@PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ProductAdminResponse> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.activate(id));
    }

    // ── Duplicate ────────────────────────────────────────────────────

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ProductAdminResponse> duplicate(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean copyPhotos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.duplicate(id, copyPhotos));
    }

    // ── Photos ───────────────────────────────────────────────────────

    @PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductPhotoResponse> uploadPhoto(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(photoService.upload(id, file));
    }

    @PatchMapping("/{id}/photos/{photoId}/primary")
    public ResponseEntity<ProductPhotoResponse> setPrimaryPhoto(
            @PathVariable UUID id,
            @PathVariable UUID photoId) {
        return ResponseEntity.ok(photoService.setPrimary(id, photoId));
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    public ResponseEntity<Void> deletePhoto(
            @PathVariable UUID id,
            @PathVariable UUID photoId) {
        photoService.delete(id, photoId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/photos/reorder")
    public ResponseEntity<List<ProductPhotoResponse>> reorderPhotos(
            @PathVariable UUID id,
            @Valid @RequestBody PhotoReorderRequest request) {
        return ResponseEntity.ok(photoService.reorder(id, request));
    }

    // ── Variations ───────────────────────────────────────────────────

    @PostMapping("/{id}/variations")
    public ResponseEntity<ProductVariationResponse> addVariation(
            @PathVariable UUID id,
            @Valid @RequestBody ProductVariationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(variationService.add(id, request));
    }

    @DeleteMapping("/{id}/variations/{variationId}")
    public ResponseEntity<Void> removeVariation(
            @PathVariable UUID id,
            @PathVariable UUID variationId) {
        variationService.remove(id, variationId);
        return ResponseEntity.noContent().build();
    }

    // ── Volume Discounts ─────────────────────────────────────────────

    @GetMapping("/{id}/discounts")
    public ResponseEntity<List<ProductVolumeDiscountResponse>> listDiscounts(@PathVariable UUID id) {
        return ResponseEntity.ok(discountService.list(id));
    }

    @PostMapping("/{id}/discounts")
    public ResponseEntity<ProductVolumeDiscountResponse> createDiscount(
            @PathVariable UUID id,
            @Valid @RequestBody ProductVolumeDiscountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(discountService.create(id, request));
    }

    @DeleteMapping("/{id}/discounts/{discountId}")
    public ResponseEntity<Void> deleteDiscount(@PathVariable UUID id, @PathVariable UUID discountId) {
        discountService.delete(id, discountId);
        return ResponseEntity.noContent().build();
    }

    // ── Price History ─────────────────────────────────────────────────

    @GetMapping("/{id}/price-history")
    public ResponseEntity<List<ProductPriceHistoryResponse>> priceHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getPriceHistory(id));
    }

    // ── CSV Import ────────────────────────────────────────────────────

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductImportResult> importCsv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(productService.importCsv(file));
    }
}
