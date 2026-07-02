package br.com.centralmax.maxhub.product.photo;

import br.com.centralmax.maxhub.common.exception.BusinessException;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.product.Product;
import br.com.centralmax.maxhub.product.ProductRepository;
import br.com.centralmax.maxhub.product.photo.dto.PhotoReorderRequest;
import br.com.centralmax.maxhub.product.photo.dto.ProductPhotoResponse;
import br.com.centralmax.maxhub.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductPhotoService {

    private static final int MAX_PHOTOS = 10;
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private final ProductPhotoRepository photoRepository;
    private final ProductPhotoMapper photoMapper;
    private final ProductRepository productRepository;
    private final StorageService storageService;

    @Transactional
    public ProductPhotoResponse upload(UUID productId, MultipartFile file) {
        Product product = findProductOrThrow(productId);

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BusinessException("Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou GIF.");
        }

        long count = photoRepository.countByProductId(productId);
        if (count >= MAX_PHOTOS) {
            throw new BusinessException("Limite de " + MAX_PHOTOS + " fotos por produto atingido.");
        }

        String url;
        String filename;
        try {
            url = storageService.upload(file, "products/" + productId);
            filename = url.substring(url.lastIndexOf('/') + 1);
        } catch (IOException e) {
            throw new BusinessException("Erro ao enviar arquivo: " + e.getMessage());
        }

        boolean isPrimary = count == 0;

        ProductPhoto photo = ProductPhoto.builder()
                .product(product)
                .filename(filename)
                .url(url)
                .primary(isPrimary)
                .displayOrder((int) count)
                .build();

        return photoMapper.toResponse(photoRepository.save(photo));
    }

    @Transactional
    public ProductPhotoResponse setPrimary(UUID productId, UUID photoId) {
        List<ProductPhoto> photos = photoRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        ProductPhoto target = photos.stream()
                .filter(p -> p.getId().equals(photoId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Foto não encontrada"));

        photos.forEach(p -> p.setPrimary(false));
        target.setPrimary(true);
        photoRepository.saveAll(photos);

        return photoMapper.toResponse(target);
    }

    @Transactional
    public void delete(UUID productId, UUID photoId) {
        ProductPhoto photo = photoRepository.findById(photoId)
                .filter(p -> p.getProduct().getId().equals(productId))
                .orElseThrow(() -> new ResourceNotFoundException("Foto não encontrada"));

        try {
            storageService.delete(photo.getUrl());
        } catch (IOException e) {
            // Log mas não bloqueia — registro no banco deve ser removido de qualquer forma
        }

        boolean wasPrimary = photo.isPrimary();
        photoRepository.delete(photo);

        if (wasPrimary) {
            List<ProductPhoto> remaining = photoRepository.findByProductIdOrderByDisplayOrderAsc(productId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setPrimary(true);
                photoRepository.save(remaining.get(0));
            }
        }
    }

    @Transactional
    public List<ProductPhotoResponse> reorder(UUID productId, PhotoReorderRequest request) {
        List<ProductPhoto> photos = photoRepository.findByProductIdOrderByDisplayOrderAsc(productId);

        for (int i = 0; i < request.order().size(); i++) {
            UUID id = request.order().get(i);
            photos.stream()
                    .filter(p -> p.getId().equals(id))
                    .findFirst()
                    .ifPresent(p -> p.setDisplayOrder(request.order().indexOf(id)));
        }

        return photoRepository.saveAll(photos).stream()
                .sorted(java.util.Comparator.comparingInt(ProductPhoto::getDisplayOrder))
                .map(photoMapper::toResponse)
                .toList();
    }

    private Product findProductOrThrow(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));
    }
}
