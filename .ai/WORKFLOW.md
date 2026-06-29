# Workflow — Como Desenvolver uma Nova Feature

Passo a passo obrigatório para qualquer feature nova ou alteração relevante no MaxHub, do planejamento ao commit.

## 1. Ler contexto

- Ler [`CONTEXT.md`](CONTEXT.md) para confirmar em que fase o projeto está e o que já existe.
- Identificar o(s) módulo(s) afetado(s) (Landing Page, Catálogo, Orçamento WhatsApp, Painel Admin, Clientes, Pedidos, Produtos, Financeiro).
- Ler o requisito correspondente em [`../docs/02-REQUISITOS_FUNCIONAIS.md`](../docs/02-REQUISITOS_FUNCIONAIS.md) (ID, prioridade, fase).

## 2. Ler regras

- Ler [`RULES.md`](RULES.md) por completo antes de escrever qualquer código.
- Ler a regra de negócio específica em [`../docs/03-REGRAS_DE_NEGOCIO.md`](../docs/03-REGRAS_DE_NEGOCIO.md), se a feature tocar lógica de domínio (preços, status de cliente, validações, etc.).
- Se a feature envolve dados, confirmar o modelo em [`../docs/04-MODELO_DE_DADOS.md`](../docs/04-MODELO_DE_DADOS.md) — se precisar de campo/tabela nova, atualizar esse documento primeiro.
- Se a feature envolve API, confirmar o contrato em [`../docs/05-API_REST.md`](../docs/05-API_REST.md) — se o endpoint não existir, documentá-lo lá antes ou junto da implementação.
- Se a feature é de frontend, confirmar estrutura/padrões em [`../docs/06-FRONTEND.md`](../docs/06-FRONTEND.md) e [`../docs/08-DESIGN_SYSTEM.md`](../docs/08-DESIGN_SYSTEM.md).
- Se a feature é de backend, confirmar estrutura/padrões em [`../docs/07-BACKEND.md`](../docs/07-BACKEND.md).

## 3. Planejar

- Listar os arquivos que serão criados/alterados (entidade, migration, DTO, mapper, service, controller no backend; tipo, service, hook, componente, página no frontend).
- Se a tarefa for grande ou ambígua, declarar o plano antes de implementar (não decidir regra de negócio não documentada por conta própria — perguntar).

## 4. Implementar

- Backend primeiro quando a feature expõe ou consome dados novos (migration → entity → repository → service → mapper → controller → DTO), seguindo [`RULES.md`](RULES.md).
- Frontend depois, consumindo o contrato já definido em `docs/05-API_REST.md` (tipos em `types/`, função em `services/`, hook em `hooks/` via React Query, componente/página).
- Nunca implementar frontend e backend divergindo do contrato documentado — se precisar divergir, atualizar o documento primeiro.

## 5. Revisar

- Conferir que a feature atende ao(s) critério(s) de aceite correspondente(s) em [`../docs/10-CRITERIOS_DE_ACEITE.md`](../docs/10-CRITERIOS_DE_ACEITE.md). Se não houver critério documentado para a feature, escrevê-lo.
- Conferir aderência às regras de [`RULES.md`](RULES.md) (DTOs, validação no backend, exclusão lógica, nomenclatura, etc.).
- Rodar build/testes existentes do projeto afetado (frontend: `npm run build`/lint; backend: `./mvnw test`) antes de considerar a tarefa concluída.

## 6. Commit

- Commit pequeno e coeso, escopado à feature/correção implementada — não misturar módulos não relacionados no mesmo commit.
- Mensagem de commit objetiva, em português, descrevendo o que mudou e por quê (ex.: `feat: adiciona endpoint de criação de cliente com validação de documento único`).
- Se a feature alterou ou criou contrato de API, modelo de dados ou regra de negócio, confirmar que o documento correspondente em `docs/` já foi atualizado antes do commit — documentação e código evoluem juntos, nunca a documentação fica defasada.
