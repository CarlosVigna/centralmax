package br.com.centralmax.maxhub.category;

import br.com.centralmax.maxhub.category.dto.CategoryRequest;
import br.com.centralmax.maxhub.category.dto.CategoryResponse;
import br.com.centralmax.maxhub.common.exception.DuplicateResourceException;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private static final Pattern DIACRITICS = Pattern.compile("[\\p{InCombiningDiacriticalMarks}]");
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9\\s-]");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");
    private static final Pattern MULTIPLE_HYPHENS = Pattern.compile("-+");

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public List<CategoryResponse> listActive() {
        return categoryRepository.findByActiveTrue().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    public List<CategoryResponse> listAll() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    public CategoryResponse getById(UUID id) {
        return categoryMapper.toResponse(findOrThrow(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Categoria já existe");
        }
        String slug = generateSlug(request.name());
        if (categoryRepository.existsBySlugIgnoreCase(slug)) {
            throw new DuplicateResourceException("Categoria já existe");
        }

        Category category = Category.builder()
                .name(request.name())
                .slug(slug)
                .active(true)
                .build();

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request) {
        Category category = findOrThrow(id);

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.name(), id)) {
            throw new DuplicateResourceException("Categoria já existe");
        }
        String slug = generateSlug(request.name());
        if (categoryRepository.existsBySlugIgnoreCaseAndIdNot(slug, id)) {
            throw new DuplicateResourceException("Categoria já existe");
        }

        category.setName(request.name());
        category.setSlug(slug);

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(UUID id) {
        Category category = findOrThrow(id);
        category.setActive(false);
        categoryRepository.save(category);
    }

    private Category findOrThrow(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }

    private String generateSlug(String name) {
        String withoutDiacritics = DIACRITICS.matcher(Normalizer.normalize(name, Normalizer.Form.NFD)).replaceAll("");
        String slug = NON_ALPHANUMERIC.matcher(withoutDiacritics.toLowerCase()).replaceAll("").trim();
        slug = WHITESPACE.matcher(slug).replaceAll("-");
        return MULTIPLE_HYPHENS.matcher(slug).replaceAll("-");
    }
}
