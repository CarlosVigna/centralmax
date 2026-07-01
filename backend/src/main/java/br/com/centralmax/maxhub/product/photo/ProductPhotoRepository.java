package br.com.centralmax.maxhub.product.photo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductPhotoRepository extends JpaRepository<ProductPhoto, UUID> {

    List<ProductPhoto> findByProductIdOrderByDisplayOrderAsc(UUID productId);

    long countByProductId(UUID productId);

    void deleteAllByProductId(UUID productId);
}
