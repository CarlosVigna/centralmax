package br.com.centralmax.maxhub.product.variation;

import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.product.Product;
import br.com.centralmax.maxhub.product.ProductRepository;
import br.com.centralmax.maxhub.product.variation.dto.ProductVariationRequest;
import br.com.centralmax.maxhub.product.variation.dto.ProductVariationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductVariationService {

    private final ProductVariationRepository variationRepository;
    private final ProductVariationMapper variationMapper;
    private final ProductRepository productRepository;

    @Transactional
    public ProductVariationResponse add(UUID productId, ProductVariationRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));

        ProductVariation variation = ProductVariation.builder()
                .product(product)
                .name(request.name().trim())
                .value(request.value().trim())
                .build();

        return variationMapper.toResponse(variationRepository.save(variation));
    }

    @Transactional
    public void remove(UUID productId, UUID variationId) {
        ProductVariation variation = variationRepository.findById(variationId)
                .filter(v -> v.getProduct().getId().equals(productId))
                .orElseThrow(() -> new ResourceNotFoundException("Variação não encontrada"));

        variation.setActive(false);
        variationRepository.save(variation);
    }
}
