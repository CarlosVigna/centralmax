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
- **Em andamento:** nada no momento — Fase 1 fechada e testada de ponta a ponta (backend real + frontend real, sem mocks).
- **Falta:** Fase 2 — Painel Administrativo (telas reais de login/dashboard/CRUD, hoje só stubs de página), módulos de Clientes, Pedidos, Fornecedores (entidades e repositórios já existem no backend, sem Controller/Service/DTO ainda — ver `decisions/001-escopo-estrutura-base-backend.md`).

Este arquivo deve ser atualizado conforme o projeto avança — é o resumo vivo do estado do MaxHub.
