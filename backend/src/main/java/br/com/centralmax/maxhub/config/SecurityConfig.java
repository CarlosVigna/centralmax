package br.com.centralmax.maxhub.config;

import br.com.centralmax.maxhub.security.JwtAuthenticationFilter;
import br.com.centralmax.maxhub.security.RestAccessDeniedHandler;
import br.com.centralmax.maxhub.security.RestAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(restAuthenticationEntryPoint)
                        .accessDeniedHandler(restAccessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        // Endpoints admin de categorias (antes das regras públicas genéricas)
                        .requestMatchers(HttpMethod.GET, "/api/categories/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/categories/*/activate").hasRole("ADMIN")
                        // Endpoints públicos de leitura
                        .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                        // Produtos admin
                        .requestMatchers(HttpMethod.GET, "/api/products/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/products/*/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/categories", "/api/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**", "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**", "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/products/*/activate").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/import").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/products/*/discounts").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/products/*/discounts").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/*/discounts/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/products/*/price-history").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/*/photos").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/*/duplicate").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/products/*/photos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/*/variations").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/*/variations/**").hasRole("ADMIN")
                        // Fornecedores — leitura autenticada, escrita/admin ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/suppliers", "/api/suppliers/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/suppliers").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/suppliers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/suppliers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/suppliers/**").hasRole("ADMIN")
                        // Clientes — autenticado (ADMIN ou VENDEDOR)
                        .requestMatchers("/api/customers", "/api/customers/**").authenticated()
                        // Rastreio público de pedidos
                        .requestMatchers(HttpMethod.GET, "/api/orders/track/**").permitAll()
                        // Pedidos — autenticado
                        .requestMatchers("/api/orders", "/api/orders/**").authenticated()
                        // Notificações — autenticado
                        .requestMatchers("/api/notifications/**").authenticated()
                        // Financeiro — autenticado
                        .requestMatchers("/api/financial", "/api/financial/**").authenticated()
                        // Usuários — somente ADMIN
                        .requestMatchers("/api/users", "/api/users/**").hasRole("ADMIN")
                        // Relatórios — autenticado
                        .requestMatchers("/api/reports/**").authenticated()
                        // Dashboard — autenticado
                        .requestMatchers("/api/dashboard/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
