# 05 — API REST

Base URL local: `http://localhost:8080/api`. Todas as respostas em JSON. Datas em ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`).

## Convenções

- Autenticação via **JWT Bearer Token** no header `Authorization: Bearer <token>`, exceto endpoints marcados como públicos.
- Erros seguem o formato padrão:

```json
{
  "timestamp": "2026-06-29T14:32:00Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Descrição legível do erro",
  "path": "/api/products",
  "fields": [
    { "field": "priceA", "message": "deve ser maior que zero" }
  ]
}
```

- Códigos de status utilizados:
  - `200 OK` — sucesso em GET/PUT/PATCH.
  - `201 Created` — sucesso em POST que cria recurso.
  - `204 No Content` — sucesso em DELETE/ação sem corpo de retorno.
  - `400 Bad Request` — erro de validação de entrada.
  - `401 Unauthorized` — token ausente ou inválido.
  - `403 Forbidden` — autenticado mas sem permissão (role insuficiente).
  - `404 Not Found` — recurso não encontrado.
  - `409 Conflict` — violação de unicidade (ex.: documento duplicado).
  - `500 Internal Server Error` — erro inesperado.

---

## `/auth`

### `POST /auth/login`
**Autenticação:** pública.
**Descrição:** autentica usuário interno e retorna JWT.

Request:
```json
{ "email": "admin@centralmax.com.br", "password": "senha123" }
```

Response `200`:
```json
{
  "token": "eyJhbGciOi...",
  "expiresIn": 3600,
  "user": { "id": "uuid", "name": "Admin", "email": "admin@centralmax.com.br", "role": "ADMIN" }
}
```

Response `401`:
```json
{ "timestamp": "...", "status": 401, "error": "INVALID_CREDENTIALS", "message": "E-mail ou senha inválidos", "path": "/api/auth/login" }
```

### `GET /auth/me`
**Autenticação:** obrigatória.
**Descrição:** retorna dados do usuário autenticado a partir do token.

Response `200`:
```json
{ "id": "uuid", "name": "Admin", "email": "admin@centralmax.com.br", "role": "ADMIN" }
```

---

## `/products`

### `GET /products`
**Autenticação:** pública (catálogo).
**Query params:** `categoryId`, `search`, `page`, `size`.
**Descrição:** lista produtos ativos. Preço retornado conforme tipo de cliente (visitante anônimo recebe `priceC` como `displayPrice`).

Response `200`:
```json
{
  "content": [
    {
      "id": "uuid",
      "name": "Caixa de Papelão 30x30x30",
      "description": "Caixa de papelão ondulado, ideal para...",
      "categoryId": "uuid",
      "categoryName": "Caixas",
      "mainImageUrl": "https://.../caixa.jpg",
      "displayPrice": 12.90
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 134,
  "totalPages": 7
}
```

### `GET /products/{id}`
**Autenticação:** pública.
**Descrição:** detalhe de produto para a página de produto do catálogo.

Response `200`:
```json
{
  "id": "uuid",
  "name": "Caixa de Papelão 30x30x30",
  "description": "Caixa de papelão ondulado, ideal para...",
  "categoryId": "uuid",
  "categoryName": "Caixas",
  "mainImageUrl": "https://.../caixa.jpg",
  "displayPrice": 12.90,
  "status": "ATIVO"
}
```

Response `404`:
```json
{ "timestamp": "...", "status": 404, "error": "NOT_FOUND", "message": "Produto não encontrado", "path": "/api/products/uuid" }
```

### `POST /products`
**Autenticação:** obrigatória — role `ADMIN`.

Request:
```json
{
  "name": "Caixa de Papelão 30x30x30",
  "description": "Caixa de papelão ondulado",
  "categoryId": "uuid",
  "supplierId": "uuid",
  "priceA": 9.90,
  "priceB": 11.00,
  "priceC": 12.90,
  "mainImageUrl": "https://.../caixa.jpg"
}
```

Response `201`: objeto do produto criado com os três preços (`priceA`, `priceB`, `priceC`), `categoryId`, `supplierId` e `status`.

Response `400`:
```json
{ "timestamp": "...", "status": 400, "error": "VALIDATION_ERROR", "message": "Dados inválidos", "path": "/api/products", "fields": [{ "field": "priceA", "message": "deve ser maior que zero" }] }
```

### `PUT /products/{id}`
**Autenticação:** obrigatória — role `ADMIN`.
**Descrição:** atualiza produto. Mesmo body do `POST`. Response `200` com objeto atualizado (mesmo formato do `POST`).

### `DELETE /products/{id}`
**Autenticação:** obrigatória — role `ADMIN`.
**Descrição:** exclusão lógica — define `status = INATIVO`. Nunca remove o registro físico. Produto inativo deixa de aparecer no catálogo público.

Response `204`: sem corpo.

---

## `/categories`

### `GET /categories`
**Autenticação:** pública. Lista categorias ativas.

Response `200`:
```json
[ { "id": "uuid", "name": "Caixas", "slug": "caixas" } ]
```

### `GET /categories/{id}`
**Autenticação:** pública. Busca categoria por id.

Response `200`:
```json
{ "id": "uuid", "name": "Caixas", "slug": "caixas", "active": true }
```

Response `404`:
```json
{ "timestamp": "...", "status": 404, "error": "NOT_FOUND", "message": "Categoria não encontrada", "path": "/api/categories/uuid" }
```

### `POST /categories`
**Autenticação:** obrigatória — role `ADMIN`.

Request:
```json
{ "name": "Caixas" }
```

Descrição: o `slug` é gerado automaticamente a partir do `name` (minúsculas, sem acentos, espaços substituídos por hífen).

Response `201`:
```json
{ "id": "uuid", "name": "Caixas", "slug": "caixas", "active": true }
```

Response `409`:
```json
{ "timestamp": "...", "status": 409, "error": "DUPLICATE_RESOURCE", "message": "Categoria já existe", "path": "/api/categories" }
```

### `PUT /categories/{id}`
**Autenticação:** obrigatória — role `ADMIN`. Atualiza nome (e regera o slug) da categoria. Mesmo body do `POST`, response `200`.

### `DELETE /categories/{id}`
**Autenticação:** obrigatória — role `ADMIN`.
**Descrição:** exclusão lógica — define `active = false`. Nunca remove o registro físico. Categoria inativa deixa de aparecer na listagem pública.

Response `204`: sem corpo.

---

## `/customers`

*(Fase 2)*

### `GET /customers`
**Autenticação:** obrigatória.
**Query params:** `status`, `origin`, `search`, `page`, `size`.

Response `200`: lista paginada (mesmo formato de paginação de `/products`), itens com `id`, `name`, `document`, `phone`, `customerType`, `status`, `origin`.

### `GET /customers/{id}`
**Autenticação:** obrigatória. Retorna detalhe completo do cliente, incluindo histórico resumido de pedidos (`orders: [{id, status, total, createdAt}]`).

### `POST /customers`
**Autenticação:** obrigatória.

Request:
```json
{
  "name": "João da Silva",
  "document": "12345678900",
  "phone": "17999998888",
  "email": "joao@email.com",
  "address": "Rua A, 123 - São José do Rio Preto/SP",
  "customerType": "C",
  "origin": "WHATSAPP"
}
```

Response `201`: objeto do cliente criado, com `status: "PROSPECT"` padrão.

Response `409`:
```json
{ "timestamp": "...", "status": 409, "error": "DUPLICATE_RESOURCE", "message": "Cliente já cadastrado com este documento", "path": "/api/customers" }
```

### `PUT /customers/{id}`
**Autenticação:** obrigatória. Atualiza dados do cliente (exceto `origin`, imutável).

### `PATCH /customers/{id}/status`
**Autenticação:** obrigatória. Altera status (`PROSPECT`, `ATIVO`, `INATIVO`).

---

## `/orders`

*(Fase 2)*

### `GET /orders`
**Autenticação:** obrigatória.
**Query params:** `status`, `customerId`, `from`, `to`, `page`, `size`.

Response `200`: lista paginada com `id`, `customerName`, `status`, `origin`, `total`, `createdAt`.

### `GET /orders/{id}`
**Autenticação:** obrigatória. Retorna pedido completo com itens.

Response `200`:
```json
{
  "id": "uuid",
  "customerId": "uuid",
  "customerName": "João da Silva",
  "status": "CONFIRMADO",
  "origin": "WHATSAPP",
  "total": 33.70,
  "notes": null,
  "items": [
    { "productId": "uuid", "productName": "Caixa de Papelão 30x30x30", "quantity": 1, "unitPrice": 12.90 },
    { "productId": "uuid", "productName": "Fita Adesiva Transparente 48mm", "quantity": 2, "unitPrice": 8.50 }
  ],
  "createdAt": "2026-06-29T14:32:00Z"
}
```

### `POST /orders`
**Autenticação:** obrigatória.

Request:
```json
{
  "customerId": "uuid",
  "origin": "WHATSAPP",
  "notes": "Cliente quer entrega até sexta",
  "items": [
    { "productId": "uuid", "quantity": 1 },
    { "productId": "uuid", "quantity": 2 }
  ]
}
```

Descrição: o backend resolve `unitPrice` de cada item a partir do preço do produto correspondente ao `customerType` do cliente informado, e calcula `total`.

Response `201`: objeto do pedido criado (mesmo formato do `GET /orders/{id}`), `status: "ORCAMENTO"`.

Response `400`:
```json
{ "timestamp": "...", "status": 400, "error": "VALIDATION_ERROR", "message": "Pedido deve ter ao menos 1 item", "path": "/api/orders" }
```

### `PATCH /orders/{id}/status`
**Autenticação:** obrigatória.

Request:
```json
{ "status": "CONFIRMADO" }
```

Descrição: ao transicionar para `CONFIRMADO`, o backend gera automaticamente os registros de `stock_movements` (tipo `SAIDA`) para cada item do pedido.

Response `200`: pedido atualizado.

---

## `/suppliers`

*(Fase 2)*

### `GET /suppliers`
**Autenticação:** obrigatória. Lista fornecedores ativos.

### `POST /suppliers`
**Autenticação:** obrigatória — role `ADMIN`.

Request:
```json
{ "name": "Fornecedor Embalagens LTDA", "document": "12345678000199", "phone": "1733334444", "email": "contato@fornecedor.com" }
```

Response `201`: objeto do fornecedor criado.

### `PUT /suppliers/{id}`
**Autenticação:** obrigatória — role `ADMIN`. Atualiza dados do fornecedor.

---

## `/dashboard`

*(Fase 2/3)*

### `GET /dashboard/summary`
**Autenticação:** obrigatória.
**Descrição:** indicadores resumidos para a tela inicial do Painel Admin.

Response `200`:
```json
{
  "ordersThisMonth": 42,
  "newCustomersThisMonth": 11,
  "revenueThisMonth": 5230.50,
  "topProducts": [
    { "productId": "uuid", "productName": "Caixa de Papelão 30x30x30", "totalSold": 87 }
  ]
}
```
