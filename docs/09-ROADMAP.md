# 09 — Roadmap

## Fase 1 — Landing Page + Catálogo + Orçamento via WhatsApp

**Entregáveis:**
- Landing Page institucional (Home).
- Catálogo de produtos público, com filtro por categoria e busca.
- Página de detalhe de produto.
- Carrinho de orçamento (persistido em localStorage).
- Geração de mensagem formatada e abertura do WhatsApp com orçamento.
- Backend: endpoints públicos de `products` e `categories` (somente leitura), seed inicial de produtos/categorias via migration ou script.
- Banco de dados estruturado para todas as entidades (mesmo que algumas só sejam usadas a partir da Fase 2), via Flyway.

**Estimativa:** 3 a 4 semanas (1 desenvolvedor full-stack, com apoio de IA para geração de código).

**Critérios de conclusão:**
- Visitante consegue navegar no catálogo, montar um carrinho e enviar um orçamento formatado via WhatsApp, de ponta a ponta, em mobile e desktop.
- Catálogo reflete produtos reais cadastrados no banco (não mockados no frontend).
- Landing Page publicada na Vercel, backend publicado no Railway/Render, ambos integrados.

## Fase 2 — Painel Administrativo + Clientes + Pedidos

**Entregáveis:**
- Login e autenticação JWT com roles `ADMIN`/`VENDEDOR`.
- CRUD completo de produtos, categorias e fornecedores (Painel Admin).
- CRUD completo de clientes, com classificação por status e origem.
- CRUD de pedidos, com itens, cálculo automático de total e transição de status.
- Geração de movimentação de produto (`stock_movements`) ao confirmar pedido.
- Dashboard inicial com indicadores resumidos.

**Estimativa:** 4 a 6 semanas, a partir da conclusão da Fase 1.

**Critérios de conclusão:**
- Equipe interna consegue cadastrar produtos/clientes e registrar pedidos sem usar planilha ou WhatsApp como fonte de verdade.
- Controle de acesso por role funcionando (VENDEDOR não acessa gestão de catálogo/fornecedores/usuários).
- Preço exibido no catálogo público já reflete corretamente o tipo de cliente quando aplicável (ex.: atendimento direto registrado pelo vendedor).

## Fase 3 — Financeiro básico + Relatórios

**Entregáveis:**
- Lançamentos financeiros simples (entrada/saída), vinculados ou não a pedidos.
- Visão de fluxo de caixa simplificado por período.
- Relatórios de vendas por período, produto e canal de origem.
- Exportação de relatórios em CSV.

**Estimativa:** 3 a 4 semanas, a partir da conclusão da Fase 2.

**Critérios de conclusão:**
- Administrador consegue visualizar saldo de caixa simplificado e principais relatórios sem precisar de planilha externa.
- Relatórios refletem dados reais de pedidos e lançamentos financeiros do sistema.

## Fora de escopo (por enquanto)

- **Controle de estoque físico** (saldo, alertas de reposição, inventário) — apenas o log de movimentações (`stock_movements`) é mantido desde a Fase 1/2 como preparação.
- **Pagamento online** (gateway de pagamento, cartão, Pix automático) — toda negociação de pagamento ocorre manualmente via WhatsApp.
- **Aplicativo mobile nativo** — o sistema é web responsivo; não há app iOS/Android nesta fase.
- **Integração automática com marketplaces** (Mercado Livre, Shopee, TikTok Shop) — esses canais continuam operados manualmente pela equipe; o MaxHub não sincroniza pedidos ou estoque com eles nesta fase.
- **Emissão fiscal (NF-e)** — fora de escopo até haver definição contábil/fiscal formal.
- **Multiusuário com permissões granulares além de ADMIN/VENDEDOR** — apenas essas duas roles existem; não há permissões por módulo individual.
