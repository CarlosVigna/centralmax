# 06 — Frontend

Stack: React + TypeScript + Vite, TailwindCSS, React Query, React Hook Form, Axios.

## Estrutura de pastas

```
frontend/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── PublicRoute.tsx
│   │   └── PrivateRoute.tsx
│   ├── pages/
│   │   ├── public/
│   │   │   ├── HomePage.tsx
│   │   │   ├── CatalogPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   └── admin/
│   │       ├── LoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── ProductsPage.tsx
│   │       ├── ProductFormPage.tsx
│   │       ├── CategoriesPage.tsx
│   │       ├── SuppliersPage.tsx
│   │       ├── CustomersPage.tsx
│   │       ├── CustomerFormPage.tsx
│   │       ├── CustomerDetailPage.tsx
│   │       ├── OrdersPage.tsx
│   │       └── OrderDetailPage.tsx
│   ├── components/
│   │   ├── ui/                  # Button, Input, Card, Badge, Modal, Table, Toast
│   │   ├── layout/               # Header, Footer, AdminSidebar, AdminLayout, PublicLayout
│   │   ├── catalog/               # ProductCard, ProductGrid, CategoryFilter, SearchBar
│   │   └── cart/                  # CartDrawer, CartItem, CartSummary
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   ├── useCategories.ts
│   │   ├── useCustomers.ts
│   │   ├── useOrders.ts
│   │   ├── useAuth.ts
│   │   └── useCart.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── services/
│   │   ├── api.ts                 # instância Axios base
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── categoryService.ts
│   │   ├── customerService.ts
│   │   ├── orderService.ts
│   │   └── supplierService.ts
│   ├── types/
│   │   ├── product.ts
│   │   ├── customer.ts
│   │   ├── order.ts
│   │   └── auth.ts
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   ├── formatDocument.ts
│   │   └── buildWhatsAppMessage.ts
│   └── styles/
│       └── globals.css
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

## Páginas (Pages)

### Públicas

| Página | Rota | Descrição |
|---|---|---|
| HomePage | `/` | Landing page institucional, destaques de categoria, CTA WhatsApp. |
| CatalogPage | `/catalogo` | Listagem de produtos com filtro por categoria e busca. |
| ProductDetailPage | `/catalogo/:id` | Detalhe de produto, botão "adicionar ao orçamento". |
| CartPage | `/orcamento` | Revisão do carrinho de orçamento e geração da mensagem de WhatsApp. |
| NotFoundPage | `*` | Página 404. |

### Admin (Fase 2)

| Página | Rota | Descrição |
|---|---|---|
| LoginPage | `/admin/login` | Login do Painel Admin. |
| DashboardPage | `/admin` | Indicadores resumidos. |
| ProductsPage | `/admin/produtos` | Listagem e gestão de produtos. |
| ProductFormPage | `/admin/produtos/novo`, `/admin/produtos/:id/editar` | Criação/edição de produto. |
| CategoriesPage | `/admin/categorias` | Gestão de categorias. |
| SuppliersPage | `/admin/fornecedores` | Gestão de fornecedores. |
| CustomersPage | `/admin/clientes` | Listagem e filtro de clientes. |
| CustomerFormPage | `/admin/clientes/novo`, `/admin/clientes/:id/editar` | Criação/edição de cliente. |
| CustomerDetailPage | `/admin/clientes/:id` | Detalhe do cliente + histórico de pedidos. |
| OrdersPage | `/admin/pedidos` | Listagem e filtro de pedidos. |
| OrderDetailPage | `/admin/pedidos/:id` | Detalhe do pedido, alteração de status. |

## Componentes reutilizáveis

- **ui/**: `Button`, `Input`, `Select`, `Card`, `Badge`, `Modal`, `Table`, `Toast` — ver variantes em [08-DESIGN_SYSTEM.md](08-DESIGN_SYSTEM.md).
- **layout/**: `Header` e `Footer` (público), `AdminSidebar` e `AdminLayout` (admin), `PublicLayout` (wrapper de Header+Footer+Outlet).
- **catalog/**: `ProductCard` (card de produto na grade), `ProductGrid` (grid responsivo), `CategoryFilter` (filtro lateral/dropdown), `SearchBar`.
- **cart/**: `CartDrawer` (carrinho lateral acessível de qualquer página pública), `CartItem` (linha de item com quantidade), `CartSummary` (totais e botão de finalizar).

## Hooks customizados

Todos os hooks de dados usam **React Query** (`useQuery`/`useMutation`) por cima dos `services/*.ts`.

- `useProducts(filters)` — lista produtos do catálogo, com cache e refetch ao mudar filtro.
- `useCategories()` — lista categorias ativas, cache longo (mudam pouco).
- `useCustomers(filters)` — lista clientes (admin).
- `useOrders(filters)` — lista pedidos (admin).
- `useAuth()` — expõe `user`, `login()`, `logout()`, `isAuthenticated`, lendo/escrevendo no `AuthContext`.
- `useCart()` — expõe itens do carrinho, `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `total`, lendo/escrevendo no `CartContext`.

## Contextos

### `AuthContext`
- Estado: `user` (dados do usuário logado ou `null`), `token`, `isAuthenticated`.
- Ações: `login(email, password)`, `logout()`.
- Persistência: token salvo em `localStorage` (`maxhub_token`); ao montar a aplicação, o contexto tenta restaurar a sessão chamando `GET /auth/me` com o token salvo.
- Usado por `PrivateRoute` para proteger rotas `/admin/*`.

### `CartContext`
- Estado: lista de itens (`productId`, `name`, `quantity`, `unitPrice`), persistida em `localStorage` (`maxhub_cart`).
- Ações: `addItem(product, quantity)`, `removeItem(productId)`, `updateQuantity(productId, quantity)`, `clearCart()`.
- Derivado: `total` (soma de `quantity * unitPrice`), `itemCount`.
- Usado pela área pública (Landing/Catálogo/Carrinho); não é usado na área Admin.

## Serviços de API (Axios)

`services/api.ts` exporta uma instância única do Axios:

```ts
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
```

- Interceptor de request: injeta `Authorization: Bearer <token>` quando há sessão ativa (lido do `AuthContext`/`localStorage`).
- Interceptor de response: em `401`, limpa a sessão e redireciona para `/admin/login`.
- Cada `*Service.ts` (`productService`, `customerService`, etc.) exporta funções tipadas que chamam `api.get/post/put/patch` e retornam os tipos definidos em `types/`.

## Fluxo de navegação

**Visitante (Fase 1):**
`HomePage` → `CatalogPage` (filtra/busca) → `ProductDetailPage` (opcional) → adiciona itens ao carrinho (via `ProductCard` ou `ProductDetailPage`) → `CartPage` → preenche nome → gera mensagem e abre WhatsApp.

**Equipe interna (Fase 2):**
`LoginPage` → `DashboardPage` → navega via `AdminSidebar` para `ProductsPage` / `CustomersPage` / `OrdersPage` → ações de CRUD em cada módulo → `CustomerDetailPage`/`OrderDetailPage` para visão detalhada.

## Rotas públicas vs. privadas

- **Públicas** (sem autenticação): `/`, `/catalogo`, `/catalogo/:id`, `/orcamento`, `/admin/login`.
- **Privadas** (exigem JWT válido via `PrivateRoute`): todas as rotas sob `/admin/*` exceto `/admin/login`.
- `PrivateRoute` redireciona para `/admin/login` se `isAuthenticated` for `false`; rotas específicas de `ADMIN` (ex.: gestão de usuários, fornecedores) também verificam `user.role === 'ADMIN'` e redirecionam/bloqueiam caso o usuário seja `VENDEDOR`.

## Responsividade

Breakpoints (padrão Tailwind, sem customização):

| Breakpoint | Largura mínima | Uso principal |
|---|---|---|
| `sm` | 640px | Ajustes de espaçamento em telas pequenas. |
| `md` | 768px | Grid de catálogo passa de 1 para 2 colunas; sidebar admin colapsa em menu hambúrguer abaixo disso. |
| `lg` | 1024px | Grid de catálogo passa para 3 colunas; sidebar admin fixa visível. |
| `xl` | 1280px | Grid de catálogo passa para 4 colunas; largura máxima de conteúdo aplicada. |

Comportamento mobile:
- Landing Page e Catálogo: mobile-first, 1 coluna, botão de WhatsApp fixo no rodapé.
- Carrinho: drawer em tela cheia no mobile, painel lateral fixo a partir de `md`.
- Painel Admin: sidebar colapsa em menu hambúrguer abaixo de `md`; tabelas com scroll horizontal em telas pequenas.
