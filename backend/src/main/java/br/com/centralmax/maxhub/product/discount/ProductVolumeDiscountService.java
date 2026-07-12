package br.com.centralmax.maxhub.product.discount;

import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.product.Product;
import br.com.centralmax.maxhub.product.ProductRepository;
import br.com.centralmax.maxhub.product.discount.dto.ProductVolumeDiscountRequest;
import br.com.centralmax.maxhub.product.discount.dto.ProductVolumeDiscountResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductVolumeDiscountService {

    private final ProductVolumeDiscountRepository discountRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductVolumeDiscountResponse> list(UUID productId) {
        findProductOrThrow(productId);
        return discountRepository.findByProductIdOrderByMinQuantityDesc(productId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProductVolumeDiscountResponse create(UUID productId, ProductVolumeDiscountRequest request) {
        Product product = findProductOrThrow(productId);
        ProductVolumeDiscount discount = ProductVolumeDiscount.builder()
                .product(product)
                .minQuantity(request.minQuantity())
                .discountPercent(request.discountPercent())
                .build();
        return toResponse(discountRepository.save(discount));
    }

    @Transactional
    public void delete(UUID productId, UUID discountId) {
        findProductOrThrow(productId);
        discountRepository.deleteByProductIdAndId(productId, discountId);
    }

    private Product findProductOrThrow(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));
    }

    private ProductVolumeDiscountResponse toResponse(ProductVolumeDiscount d) {
        return new ProductVolumeDiscountResponse(d.getId(), d.getMinQuantity(), d.getDiscountPercent(), d.getCreatedAt());
    }
}
