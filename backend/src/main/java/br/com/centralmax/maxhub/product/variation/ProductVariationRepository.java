package br.com.centralmax.maxhub.product.variation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductVariationRepository extends JpaRepository<ProductVariation, UUID> {

    List<ProductVariation> findByProductIdAndActiveTrueOrderByCreatedAtAsc(UUID productId);
}
