# Contexto do Projeto — MaxHub

## O que é

MaxHub é o sistema interno da Central Max Embalagens, distribuidora de embalagens em São José do Rio Preto/SP. A empresa opera sem estoque próprio: compra de fornecedores sob demanda, conforme os pedidos chegam pelos canais de venda (Landing Page, WhatsApp, Instagram, Facebook, Mercado Livre, Shopee, TikTok Shop, presencial).

O MaxHub centraliza: catálogo de produtos com preços diferenciados por tipo de cliente, geração de orçamento via WhatsApp, cadastro de clientes e pedidos, e (futuramente) controle financeiro básico.

Detalhes completos de negócio: [`../docs/01-VISAO_DO_NEGOCIO.md`](../docs/01-VISAO_DO_NEGOCIO.md) e [`../docs/03-REGRAS_DE_NEGOCIO.md`](../docs/03-REGRAS_DE_NEGOCIO.md).

## Stack

- **Frontend:** React + TypeScript + Vite, TailwindCSS, React Query, React Hook Form, Axios.
- **Backend:** Java 21 + Spring Boot, Spring Security + JWT, JPA + Hibernate + Flyway, Lombok + MapStruct.
- **Banco:** PostgreSQL.
- **Infra local:** Docker + Docker Compose.
- **Deploy:** Frontend → Vercel · Backend → Railway ou Render.
- **Arquitetura:** Clean Architecture, SOLID, Clean Code. Frontend e backend totalmente separados, comunicação via API REST.

## Fases

1. **Fase 1 (foco atual):** Landing Page + Catálogo de Produtos + Orçamento via WhatsApp. Sem login de cliente, sem painel admin, sem pagamento online.
2. **Fase 2:** Painel Administrativo (login JWT, roles ADMIN/VENDEDOR) + gestão de Clientes + gestão de Pedidos + gestão de Produtos/Categorias/Fornecedores.
3. **Fase 3:** Financeiro básico (lançamentos, fluxo de caixa) + Relatórios.

Roadmap detalhado e fora-de-escopo: [`../docs/09-ROADMAP.md`](../docs/09-ROADMAP.md).

## Módulos

Landing Page, Catálogo, Orçamento WhatsApp, Painel Admin, Clientes, Pedidos, Produtos, Financeiro. Requisitos funcionais completos por módulo: [`../docs/02-REQUISITOS_FUNCIONAIS.md`](../docs/02-REQUISITOS_FUNCIONAIS.md).

## Regras de negócio essenciais (resumo)

- Todo produto tem 3 preços: A (atacado), B (intermediário), C (final/padrão). O preço exibido depende do tipo do cliente; visitante anônimo sempre vê Preço C.
- Cliente tem status: Prospect (padrão na criação), Ativo, Inativo. E origem (enum fixo: Landing, WhatsApp, Instagram, Facebook, Mercado Livre, Shopee, TikTok, Visita, Indicação, Telefone) — imutável após cadastro.
- Não há pagamento online em nenhuma fase coberta por este roadmap. O fechamento é negociado manualmente via WhatsApp.
- Ao finalizar o carrinho na Landing Page, o sistema gera uma mensagem formatada e abre o WhatsApp — não envia a mensagem automaticamente.
- Toda confirmação de pedido gera um registro de movimentação (`stock_movements`, tipo SAIDA), mesmo sem controle de estoque físico ainda.

Detalhe completo: [`../docs/03-REGRAS_DE_NEGOCIO.md`](../docs/03-REGRAS_DE_NEGOCIO.md).

## Estado atual do projeto

- **Feito — Fase 1 concluída:**
  - Documentação completa das 3 fases (visão de negócio, requisitos, regras, modelo de dados, API, frontend, backend, design system, roadmap, critérios de aceite).
  - Backend (Spring Boot) rodando, conectado ao PostgreSQL no Neon, com Flyway aplicando `V1__create_initial_schema.sql` (schema completo) e `V2__seed_admin_user.sql` (usuário admin de teste).
  - Autenticação JWT funcional (`/api/auth/login`, `/api/auth/me`), com `SecurityConfig` distinguindo rotas públicas e `ADMIN`.
  - Módulo de **Categorias** completo (`/api/categories`): listagem/detalhe públicos, criação/edição/exclusão lógica restritas a `ADMIN`.
  - Módulo de **Produtos** completo (`/api/products`): listagem paginada com filtro por categoria/busca (pública, retorna `displayPrice` = Preço C), detalhe público, criação/edição/exclusão lógica restritas a `ADMIN` (com os 3 preços).
  - Frontend (React + Vite): Landing Page, página de Catálogo consumindo a API real (filtro por categoria, busca, estados de loading/vazio), Carrinho (Context + Drawer + página dedicada) com ajuste de quantidade e subtotal, geração de orçamento via WhatsApp (mensagem formatada com emoji/negrito, abrindo `api.whatsapp.com` direto — `wa.me` tem um bug de redirect que corrompe emoji), ícone de carrinho com badge no header.

- **Feito — Fase 2 (Painel Admin) — parcialmente concluída:**
  - **Login** funcional (LoginPage.tsx já conectado ao `/api/auth/login` real; AuthContext salva JWT no localStorage, PrivateRoute protege rotas).
  - **AdminLayout** com sidebar (Dashboard, Produtos, Categorias, Fornecedores, Clientes, Pedidos) e header com nome do usuário e logout.
  - **Dashboard** (`/admin`): cards com total de produtos ativos, clientes e pedidos — endpoint `GET /api/dashboard` (autenticado).
  - **Categorias** (`/admin/categorias`): tabela com nome/slug/status, modal para criar e editar, botão de desativar com confirmação — endpoint `GET /api/categories/admin` (ADMIN).
  - **Produtos** (`/admin/produtos`): tabela com nome, categoria, preço A/B/C e status, filtros de busca e status — endpoint `GET /api/products/admin` (ADMIN).
  - **Formulário de produto** (`/admin/produtos/novo` e `/admin/produtos/:id/editar`): todos os campos (nome, descrição, categoria, fornecedor, preço A/B/C, URL da imagem) com validação React Hook Form — endpoints `GET /api/products/:id/admin`, `POST /api/products`, `PUT /api/products/:id`.
  - **Fornecedores (listagem)**: endpoint `GET /api/suppliers` implementado no backend (autenticado) — apenas listagem, CRUD completo pendente para Fase 2.
  - **Validação e correções (pós-Fase 2):** LoginPage redireciona automaticamente se já autenticado (evita loop); filtro por categoria adicionado ao `GET /api/products/admin` (parâmetro `categoryId`) e à tela de produtos; mensagens de erro das mutations extraem a mensagem real do backend via `axios.isAxiosError()`; query key de categorias no ProductsPage corrigida para `['admin-categories']` (evita colisão de cache com form).

- **Identidade visual e Landing Page melhorada:**
  - Cores atualizadas: `primary: #0f1f3d` (azul marinho) e `secondary: #f97316` (laranja) no `tailwind.config.ts`.
  - Header com fundo navy e texto branco.
  - Footer completo com logo, slogan, copyright e link discreto "Área Administrativa" → `/admin/login`.
  - Landing Page (`/`) reestruturada com: Hero (navy), Benefícios (3 cards), Catálogo embutido (`CatalogSection`), CTA WhatsApp (navy). Botões WhatsApp usam `wa.me/5517991660410` (sem emoji no texto, então `wa.me` é seguro; apenas o orçamento usa `api.whatsapp.com` para evitar o bug de emoji).
  - `VITE_WHATSAPP_NUMBER=5517991660410` atualizado em `.env.local`.
  - `CatalogSection` extraído do `CatalogPage` para ser reutilizável em ambas as páginas.
  - Migração `V3__seed_initial_products.sql` aplicada: fornecedor "Emplay Embalagens" + categoria "Sacos Plásticos" + 4 produtos PEBD com preços A/B/C.

- **Clientes** (`/admin/clientes`): CRUD completo implementado. Tabela com nome/telefone/tipo(badge)/origem/data de cadastro/ações. Filtro por nome-email-telefone e por status. Formulário em página (`/admin/clientes/novo` e `/admin/clientes/:id/editar`) com todos os campos; campo `origin` desabilitado na edição (imutável). Endpoints: `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/{id}`. Regras: soft delete (active=false), email único (verifica todos os registros inclusive inativos), status padrão PROSPECT, origin imutável após cadastro. Migration `V4__alter_customers_add_active_notes.sql` aplicada: colunas `notes` e `active` adicionadas, `phone` e `document` passaram a ser opcionais.

- **Em andamento:** nada no momento.
- **Falta — restante da Fase 2:** Pedidos (Service/Controller/DTO/telas), Fornecedores (CRUD completo), reativação de produto desativado (endpoint dedicado), paginação na tela de produtos admin.
- **Infra — JDK:** Sistema não tem JDK 21 instalado. JDK disponíveis: ms-17.0.19 e openjdk-26.0.1. JDK 26 é incompatível com Lombok (TypeTag::UNKNOWN). Solucionado alterando `java.version` para 17 no pom.xml e compilando com JDK 17 (ms-17.0.19). Maven via `~/.m2/wrapper/dists/apache-maven-3.9.15-bin/.../mvn.cmd`.

Este arquivo deve ser atualizado conforme o projeto avança — é o resumo vivo do estado do MaxHub.
