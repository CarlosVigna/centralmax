# ADR 001 — Escopo da estrutura base do backend

## Contexto

A tarefa "configure a estrutura base do projeto" pediu dependências, estrutura de pacotes Clean Architecture conforme `docs/07-BACKEND.md`, docker-compose, `application.yml` e a migration inicial — não pediu explicitamente a implementação de endpoints de negócio (catálogo, clientes, pedidos). A árvore de pacotes documentada em `docs/07-BACKEND.md`, porém, lista Controller/Service/Mapper/DTO completos para todas as entidades, incluindo módulos de Fase 2/3.

## Decisão

Na configuração inicial, foram implementados por completo apenas os pacotes de infraestrutura transversal: `config`, `security`, `common`, `auth` e `user` (necessários para que a dependência Spring Security + JWT, pedida explicitamente, esteja de fato configurada e funcional com um fluxo de login real).

Para `category`, `supplier`, `product`, `customer`, `order` (+ `OrderItem`) e `stock`, foram criadas apenas as camadas **Entity** e **Repository**, espelhando 1:1 as tabelas da migration `V1__create_initial_schema.sql`. Controllers, Services, Mappers e DTOs dessas entidades **não foram criados** nesta etapa.

## Consequências

- O backend compila e sobe com a migration aplicada, mas não expõe nenhum endpoint de catálogo, clientes ou pedidos ainda — apenas `/api/auth/login` e `/api/auth/me`.
- A implementação dos endpoints públicos de produtos/categorias (Fase 1) e dos módulos de Fase 2/3 deve ser tratada como tarefa(s) seguinte(s), seguindo os prompts de `.ai/PROMPTS.md` e as regras de `.ai/RULES.md`.
- Evita-se implementar funcionalidade de fases futuras por antecipação (regra 19 de `.ai/RULES.md`).
