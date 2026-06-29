# MaxHub

Sistema interno da **Central Max Embalagens** — distribuidora de embalagens em São José do Rio Preto/SP.

O MaxHub centraliza catálogo de produtos, geração de orçamento via WhatsApp, gestão de clientes, pedidos e, futuramente, controle financeiro básico. A empresa opera sem estoque próprio na fase inicial: a compra é feita sob demanda conforme os pedidos chegam pelos canais de venda (Landing Page, WhatsApp, Instagram, Facebook, Mercado Livre, Shopee, TikTok Shop e atendimento presencial).

## Stack

**Frontend:** React + TypeScript + Vite, TailwindCSS, React Query, React Hook Form, Axios
**Backend:** Java 21 + Spring Boot, Spring Security + JWT, JPA + Hibernate + Flyway, Lombok + MapStruct
**Banco de dados:** PostgreSQL
**Infra local:** Docker + Docker Compose
**Deploy:** Frontend → Vercel · Backend → Railway ou Render

Arquitetura: Clean Architecture, princípios SOLID e Clean Code, frontend e backend totalmente separados (comunicação via API REST).

## Como rodar localmente

### Pré-requisitos
- Node.js 20+
- Java 21 (JDK)
- Maven 3.9+
- Docker + Docker Compose

### 1. Banco de dados (Docker)

```bash
cd docker
cp .env.example .env
docker compose up -d
```

Isso sobe um PostgreSQL local na porta `5432` com as credenciais definidas em `docker/.env`.

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

A API sobe por padrão em `http://localhost:8080`. As migrations do Flyway (`src/main/resources/db/migration`) são executadas automaticamente na inicialização, contra o Postgres do passo 1.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

O frontend sobe por padrão em `http://localhost:5173` e consome a API configurada em `.env` (`VITE_API_URL`).

## Estrutura de pastas

```
centralmax/
├── README.md                 # este arquivo
├── docs/                     # documentação técnica e de negócio completa
├── .ai/                       # contexto e regras para desenvolvimento assistido por IA
├── frontend/                  # aplicação React + TypeScript
├── backend/                   # aplicação Java + Spring Boot
├── database/                  # scripts auxiliares de banco (fora das migrations do Flyway)
├── docker/                    # docker-compose e configs de ambiente local
├── scripts/                   # scripts utilitários (build, deploy, seed, etc.)
├── assets/                    # imagens e arquivos estáticos do projeto (não da aplicação)
├── branding/                  # identidade visual da Central Max Embalagens
├── wireframes/                # wireframes e protótipos de tela
└── decisions/                 # registro de decisões técnicas (ADRs)
```

Documentação detalhada de cada módulo está em [`docs/`](docs/). Regras e contexto para desenvolvimento assistido por IA estão em [`.ai/`](.ai/).

## Roadmap resumido

- **Fase 1 (foco atual):** Landing Page + Catálogo de Produtos + Orçamento via WhatsApp
- **Fase 2:** Painel Administrativo + Clientes + Pedidos
- **Fase 3:** Financeiro básico + Relatórios

Detalhamento completo em [`docs/09-ROADMAP.md`](docs/09-ROADMAP.md).
