package br.com.centralmax.maxhub.auth;

import br.com.centralmax.maxhub.auth.dto.LoginRequest;
import br.com.centralmax.maxhub.auth.dto.LoginResponse;
import br.com.centralmax.maxhub.common.exception.ResourceNotFoundException;
import br.com.centralmax.maxhub.config.JwtProperties;
import br.com.centralmax.maxhub.security.JwtTokenProvider;
import br.com.centralmax.maxhub.user.User;
import br.com.centralmax.maxhub.user.UserRepository;
import br.com.centralmax.maxhub.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .filter(User::isActive)
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getRole().name());
        return new LoginResponse(token, jwtProperties.expirationMs() / 1000, toUserResponse(user));
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
