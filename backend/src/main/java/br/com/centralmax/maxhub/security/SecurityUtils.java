package br.com.centralmax.maxhub.security;

import br.com.centralmax.maxhub.user.User;
import br.com.centralmax.maxhub.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public Optional<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return userRepository.findByEmail(auth.getName());
    }

    public boolean isAdmin() {
        return getCurrentUser()
                .map(u -> u.getRole().name().equals("ADMIN"))
                .orElse(false);
    }

    public boolean isVendedor() {
        return getCurrentUser()
                .map(u -> u.getRole().name().equals("VENDEDOR"))
                .orElse(false);
    }
}
