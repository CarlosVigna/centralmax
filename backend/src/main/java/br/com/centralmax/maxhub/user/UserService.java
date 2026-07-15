package br.com.centralmax.maxhub.user;

import br.com.centralmax.maxhub.common.exception.BusinessException;
import br.com.centralmax.maxhub.common.exception.DuplicateResourceException;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.user.dto.ChangePasswordRequest;
import br.com.centralmax.maxhub.user.dto.UserRequest;
import br.com.centralmax.maxhub.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> listAll() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse create(UserRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new DuplicateResourceException("Email já cadastrado");
        }
        if (request.password() == null || request.password().isBlank()) {
            throw new BusinessException("Senha é obrigatória para criação de usuário");
        }
        User user = User.builder()
                .name(request.name().trim())
                .email(request.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .active(true)
                .commissionPriceA(request.commissionPriceA())
                .commissionPriceB(request.commissionPriceB())
                .commissionPriceC(request.commissionPriceC())
                .territory(request.territory())
                .build();
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(UUID id, UserRequest request) {
        User user = findOrThrow(id);
        userRepository.findByEmail(request.email().trim().toLowerCase())
                .filter(found -> !found.getId().equals(id))
                .ifPresent(found -> { throw new DuplicateResourceException("Email já cadastrado"); });
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setRole(request.role());
        user.setCommissionPriceA(request.commissionPriceA());
        user.setCommissionPriceB(request.commissionPriceB());
        user.setCommissionPriceC(request.commissionPriceC());
        user.setTerritory(request.territory());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(UUID id, ChangePasswordRequest request) {
        User user = findOrThrow(id);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);
    }

    @Transactional
    public void delete(UUID id, String currentUserEmail) {
        User user = findOrThrow(id);
        if (user.getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new BusinessException("Não é possível desativar o próprio usuário");
        }
        user.setActive(false);
        userRepository.save(user);
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.isActive(), user.getCreatedAt(),
                user.getCommissionPriceA(), user.getCommissionPriceB(),
                user.getCommissionPriceC(), user.getTerritory());
    }

    private User findOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }
}
