package br.com.centralmax.maxhub.product.photo;

import br.com.centralmax.maxhub.common.exception.BusinessException;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.product.Product;
import br.com.centralmax.maxhub.product.ProductRepository;
import br.com.centralmax.maxhub.product.photo.dto.PhotoReorderRequest;
import br.com.centralmax.maxhub.product.photo.dto.ProductPhotoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.upload.base-url}")
    private String baseUrl;

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

        String extension = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize()
                .resolve("products").resolve(productId.toString());
        Path filePath = dir.resolve(filename);

        try {
            Files.createDirectories(dir);
            file.transferTo(filePath.toFile());
        } catch (IOException e) {
            throw new BusinessException("Erro ao salvar arquivo: " + e.getMessage());
        }

        boolean isPrimary = count == 0;
        String url = baseUrl + "/products/" + productId + "/" + filename;

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

        // Delete physical file
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize()
                .resolve("products").resolve(productId.toString()).resolve(photo.getFilename());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't block — DB record must be removed regardless
        }

        boolean wasPrimary = photo.isPrimary();
        photoRepository.delete(photo);

        // Promote next photo to primary if deleted was the cover
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

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}
