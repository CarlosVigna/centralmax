package br.com.centralmax.maxhub.product.discount;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductVolumeDiscountRepository extends JpaRepository<ProductVolumeDiscount, UUID> {

    List<ProductVolumeDiscount> findByProductIdOrderByMinQuantityDesc(UUID productId);

    void deleteByProductIdAndId(UUID productId, UUID id);
}
