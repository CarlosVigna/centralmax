package br.com.centralmax.maxhub.product.history;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductPriceHistoryRepository extends JpaRepository<ProductPriceHistory, UUID> {

    List<ProductPriceHistory> findByProductIdOrderByChangedAtDesc(UUID productId, Pageable pageable);
}
