# 07 — Backend

Stack: Java 21 + Spring Boot, Spring Security + JWT, JPA + Hibernate + Flyway, Lombok + MapStruct. Arquitetura em camadas seguindo Clean Architecture (separação clara entre domínio, aplicação e infraestrutura).

## Estrutura de pacotes

```
backend/src/main/java/br/com/centralmax/maxhub/
├── MaxhubApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── JwtConfig.java
│   └── OpenApiConfig.java
├── common/
│   ├── exception/
│   │   ├── BusinessException.java
│   │   ├── ResourceNotFoundException.java
│   │   ├── DuplicateResourceException.java
│   │   └── GlobalExceptionHandler.java
│   └── response/
│       ├── ApiErrorResponse.java
│       └── PageResponse.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java
│   └── dto/
│       ├── LoginRequest.java
│       └── LoginResponse.java
├── user/
│   ├── User.java
│   ├── UserRepository.java
│   ├── UserRole.java
│   └── dto/UserResponse.java
├── category/
│   ├── Category.java
│   ├── CategoryController.java
│   ├── CategoryService.java
│   ├── CategoryRepository.java
│   ├── CategoryMapper.java
│   └── dto/
│       ├── CategoryRequest.java
│       └── CategoryResponse.java
├── supplier/
│   └── ... (mesma estrutura de category)
├── product/
│   ├── Product.java
│   ├── ProductStatus.java
│   ├── ProductController.java
│   ├── ProductService.java
│   ├── ProductRepository.java
│   ├── ProductMapper.java
│   └── dto/
│       ├── ProductRequest.java
│       ├── ProductResponse.java
│       └── ProductSummaryResponse.java
├── customer/
│   ├── Customer.java
│   ├── CustomerType.java
│   ├── CustomerStatus.java
│   ├── CustomerOrigin.java
│   ├── CustomerController.java
│   ├── CustomerService.java
│   ├── CustomerRepository.java
│   ├── CustomerMapper.java
│   └── dto/
│       ├── CustomerRequest.java
│       └── CustomerResponse.java
├── order/
│   ├── Order.java
│   ├── OrderItem.java
│   ├── OrderStatus.java
│   ├── OrderController.java
│   ├── OrderService.java
│   ├── OrderRepository.java
│   ├── OrderMapper.java
│   └── dto/
│       ├── OrderRequest.java
│       ├── OrderItemRequest.java
│       └── OrderResponse.java
├── stock/
│   ├── StockMovement.java
│   ├── StockMovementType.java
│   ├── StockMovementRepository.java
│   └── StockMovementService.java
└── dashboard/
    ├── DashboardController.java
    ├── DashboardService.java
    └── dto/DashboardSummaryResponse.java
```

`src/main/resources/db/migration/` contém as migrations Flyway (`V1__create_users.sql`, `V2__create_categories.sql`, etc., uma entidade por migration na ordem de dependência: users → categories → suppliers → products → customers → orders → order_items → stock_movements).

## Camadas

- **Controller**: recebe requisição HTTP, valida entrada (`@Valid` nos DTOs de request), delega ao Service, retorna DTO de response com o status HTTP apropriado. Nunca contém lógica de negócio.
- **Service**: contém a lógica de negócio e orquestra chamadas a Repository. É a única camada que conhece regras como cálculo de total do pedido, resolução de preço por tipo de cliente, transições de status. Métodos de escrita são `@Transactional`.
- **Repository**: interface `JpaRepository<Entity, UUID>`, sem lógica — apenas queries declarativas (`findBy...`) ou `@Query` quando necessário.
- **Entity**: classe JPA anotada (`@Entity`, `@Table`), mapeia 1:1 para tabela do banco. Usa Lombok (`@Getter`, `@Builder`) para reduzir boilerplate. Nunca é exposta diretamente na API — sempre convertida via Mapper.
- **DTO**: classes simples de request/response. `*Request` para entrada (com validações Bean Validation: `@NotBlank`, `@Positive`, etc.), `*Response` para saída.
- **Mapper**: interface MapStruct (`@Mapper(componentModel = "spring")`) que converte Entity ↔ DTO. Gerado em tempo de build, sem implementação manual.
- **Exception**: exceções de negócio customizadas (`BusinessException`, `ResourceNotFoundException`, `DuplicateResourceException`), capturadas centralmente pelo `GlobalExceptionHandler`.

## Fluxo de uma requisição de ponta a ponta

Exemplo: `POST /api/orders`

1. `JwtAuthenticationFilter` intercepta a requisição, valida o token JWT do header `Authorization` e popula o `SecurityContext` com o usuário autenticado.
2. `OrderController.create(OrderRequest)` recebe o body, já validado pelo `@Valid` (ex.: rejeita se `items` estiver vazio, retornando `400` antes de chegar à lógica de negócio).
3. `OrderController` chama `OrderService.create(request)`.
4. `OrderService`:
   - Busca o `Customer` pelo `customerId` (lança `ResourceNotFoundException` → `404` se não existir).
   - Para cada item, busca o `Product` e resolve o `unitPrice` de acordo com `customer.getCustomerType()` (Preço A/B/C).
   - Monta as entidades `Order` e `OrderItem`, calcula `total`.
   - Persiste via `OrderRepository.save(order)` (cascata salva os itens).
5. `OrderMapper` converte a entidade `Order` salva em `OrderResponse`.
6. `OrderController` retorna `201 Created` com o `OrderResponse` no corpo.

Se algo falhar (ex.: produto não encontrado), a exceção lançada no Service sobe até o `GlobalExceptionHandler`, que a converte no `ApiErrorResponse` padronizado (ver [05-API_REST.md](05-API_REST.md)).

## Autenticação JWT

- Login (`POST /auth/login`) valida credenciais via `CustomUserDetailsService` + `PasswordEncoder` (BCrypt).
- Em caso de sucesso, `JwtTokenProvider` gera um token assinado (HMAC-SHA256) contendo `sub` (id do usuário), `role` e `exp` (expiração configurável, padrão 1h).
- Toda requisição subsequente envia `Authorization: Bearer <token>`.
- `JwtAuthenticationFilter` (um `OncePerRequestFilter`) extrai e valida o token em cada requisição, populando o `SecurityContextHolder` se válido; requisições sem token ou com token inválido seguem sem autenticação e são bloqueadas pelas regras do `SecurityConfig` caso a rota exija autenticação.
- Não há refresh token na Fase 1/2 — ao expirar, o usuário precisa logar novamente (o frontend trata isso no interceptor de `401`).

## Controle de permissões (roles)

Duas roles: `ADMIN` e `VENDEDOR`.

- `SecurityConfig` define as regras de autorização por rota usando `@PreAuthorize` nos métodos de Controller ou `authorizeHttpRequests` central:
  - Rotas públicas (catálogo, login): sem autenticação.
  - Rotas de leitura administrativa (listar pedidos, clientes): `ADMIN` e `VENDEDOR`.
  - Rotas de gestão sensível (criar/editar produto, fornecedor, usuários): `ADMIN` apenas.
  - `VENDEDOR` pode criar/editar pedidos e clientes, mas não gerencia catálogo (produtos/categorias/fornecedores) nem usuários.
- A verificação de role usa o claim `role` do JWT, mapeado para uma `GrantedAuthority` (`ROLE_ADMIN`, `ROLE_VENDEDOR`) no `CustomUserDetailsService`.

## Configuração de CORS

`CorsConfig` libera, em ambiente de desenvolvimento, as origens `http://localhost:5173` (frontend local). Em produção, a origem liberada é o domínio da Landing Page publicada na Vercel (configurada via variável de ambiente `FRONTEND_URL`, nunca hardcoded). Métodos liberados: `GET, POST, PUT, PATCH, DELETE, OPTIONS`. Headers liberados: `Authorization, Content-Type`. Credenciais (`allowCredentials`): `false` (autenticação é via header Bearer, não cookie).

## Tratamento global de exceções

`GlobalExceptionHandler` (`@RestControllerAdvice`) centraliza a conversão de exceções em `ApiErrorResponse`:

| Exceção | Status | error |
|---|---|---|
| `MethodArgumentNotValidException` (Bean Validation) | 400 | `VALIDATION_ERROR` |
| `BusinessException` | 400 | `BUSINESS_RULE_VIOLATION` |
| `ResourceNotFoundException` | 404 | `NOT_FOUND` |
| `DuplicateResourceException` | 409 | `DUPLICATE_RESOURCE` |
| `AccessDeniedException` | 403 | `FORBIDDEN` |
| `AuthenticationException` | 401 | `UNAUTHORIZED` |
| `Exception` (fallback) | 500 | `INTERNAL_ERROR` |

Nenhuma stack trace ou detalhe interno é exposto no corpo da resposta — apenas mensagem legível e, quando aplicável, lista de campos inválidos (`fields`).
