# 04 — Modelo de Dados

Banco: PostgreSQL. Migrations gerenciadas via Flyway (`backend/src/main/resources/db/migration`). Toda tabela tem `id` (UUID, PK, gerado), `created_at` e `updated_at` (timestamps, preenchidos automaticamente). Exclusões são lógicas (`status`/`active`), nunca `DELETE` físico, salvo tabelas puramente transacionais de log (`stock_movements`).

## Diagrama de relacionamentos (textual)

```
users
  └─ (sem relacionamento direto com entidades de negócio nesta fase)

categories
  └─< products (1:N)

suppliers
  └─< products (1:N, opcional)

products
  ├─< order_items (1:N)
  └─< stock_movements (1:N)

customers
  └─< orders (1:N)

orders
  ├─< order_items (1:N)
  └─< stock_movements (1:N, opcional — via order_id)

order_items
  ├─> products (N:1)
  └─> orders (N:1)

stock_movements
  ├─> products (N:1)
  └─> orders (N:1, opcional)
```

Legenda: `>` = referencia (FK), `<` = é referenciado por (1:N).

---

## `users`

Usuários internos (equipe) com acesso ao Painel Admin. Usado a partir da Fase 2.

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(120) | NOT NULL |
| email | VARCHAR(160) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| role | VARCHAR(20) | NOT NULL — enum: `ADMIN`, `VENDEDOR` |
| active | BOOLEAN | NOT NULL, DEFAULT true |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() |

Índices: `UNIQUE (email)`.

---

## `categories`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(80) | NOT NULL, UNIQUE |
| slug | VARCHAR(100) | NOT NULL, UNIQUE — usado em URLs do catálogo |
| active | BOOLEAN | NOT NULL, DEFAULT true |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() |

Índices: `UNIQUE (slug)`.

---

## `suppliers`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(160) | NOT NULL |
| document | VARCHAR(20) | UNIQUE, NULLABLE — CNPJ |
| phone | VARCHAR(20) | NULLABLE |
| email | VARCHAR(160) | NULLABLE |
| active | BOOLEAN | NOT NULL, DEFAULT true |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() |

Regra de validação (aplicação, não banco): `phone` ou `email` deve estar preenchido.

---

## `products`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(160) | NOT NULL |
| description | TEXT | NULLABLE |
| category_id | UUID | FK → categories.id, NOT NULL |
| supplier_id | UUID | FK → suppliers.id, NULLABLE |
| price_a | NUMERIC(12,2) | NOT NULL, CHECK (price_a > 0) |
| price_b | NUMERIC(12,2) | NOT NULL, CHECK (price_b > 0) |
| price_c | NUMERIC(12,2) | NOT NULL, CHECK (price_c > 0) |
| main_image_url | VARCHAR(500) | NULLABLE |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ATIVO' — enum: `ATIVO`, `INATIVO` |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() |

Índices: `(category_id)`, `(status)`, índice de texto (trigram ou `LOWER(name)`) para busca por nome no catálogo.

---

## `customers`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(160) | NOT NULL |
| document | VARCHAR(20) | NOT NULL, UNIQUE — CPF/CNPJ |
| phone | VARCHAR(20) | NOT NULL |
| email | VARCHAR(160) | NULLABLE |
| address | VARCHAR(255) | NULLABLE |
| customer_type | VARCHAR(1) | NOT NULL, DEFAULT 'C' — enum: `A`, `B`, `C` |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PROSPECT' — enum: `PROSPECT`, `ATIVO`, `INATIVO` |
| origin | VARCHAR(20) | NOT NULL — enum: `LANDING`, `WHATSAPP`, `INSTAGRAM`, `FACEBOOK`, `MERCADO_LIVRE`, `SHOPEE`, `TIKTOK`, `VISITA`, `INDICACAO`, `TELEFONE` |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() |

Índices: `UNIQUE (document)`, `(status)`, `(origin)`.

---

## `orders`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| customer_id | UUID | FK → customers.id, NOT NULL |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ORCAMENTO' — enum: `ORCAMENTO`, `CONFIRMADO`, `EM_PREPARACAO`, `CONCLUIDO`, `CANCELADO` |
| origin | VARCHAR(20) | NOT NULL — mesmo enum de `customers.origin` |
| total | NUMERIC(12,2) | NOT NULL, DEFAULT 0 — calculado a partir dos itens |
| notes | TEXT | NULLABLE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() |

Índices: `(customer_id)`, `(status)`, `(created_at)`.

---

## `order_items`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| order_id | UUID | FK → orders.id, NOT NULL, ON DELETE CASCADE |
| product_id | UUID | FK → products.id, NOT NULL |
| quantity | INTEGER | NOT NULL, CHECK (quantity > 0) |
| unit_price | NUMERIC(12,2) | NOT NULL, CHECK (unit_price > 0) — congelado no momento da criação |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |

Índices: `(order_id)`, `(product_id)`.

---

## `stock_movements`

Log de rastreabilidade de movimentações, sem cálculo de saldo nas Fases 1-3.

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| product_id | UUID | FK → products.id, NOT NULL |
| order_id | UUID | FK → orders.id, NULLABLE |
| type | VARCHAR(10) | NOT NULL — enum: `ENTRADA`, `SAIDA` |
| quantity | INTEGER | NOT NULL, CHECK (quantity > 0) |
| notes | TEXT | NULLABLE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |

Índices: `(product_id)`, `(order_id)`, `(type)`.

---

## Convenções gerais

- Todas as FKs usam UUID e devem ter índice (PostgreSQL não cria índice automático em FK).
- Enums são armazenados como `VARCHAR` com `CHECK` constraint no banco (não usar `ENUM` nativo do Postgres, para facilitar evolução sem migration de tipo).
- Toda migration nova é um arquivo versionado em `backend/src/main/resources/db/migration`, nome `V{n}__descricao.sql`, nunca editado após aplicado.
