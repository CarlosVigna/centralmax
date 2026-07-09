# Manual Técnico do Sistema — MaxHub (CentralMax Embalagens)

> **Destinado a:** outra IA (ou desenvolvedor) que precisará entender o sistema em profundidade para implementar melhorias, corrigir bugs ou adicionar funcionalidades.
> **Atualizado em:** 2026-07-09
> **Cobertura:** Fases 1, 2 e 3 implementadas.

---

## 1. Visão Geral

O **MaxHub** é o sistema interno da **Central Max Embalagens**, distribuidora de embalagens (caixas, sacos, fitas, plásticos, descartáveis) sediada em **São José do Rio Preto/SP**. A empresa opera **sem estoque próprio**: compra de fornecedores sob demanda, após os pedidos chegarem pelos canais de venda.

### 1.1 Problema Resolvido

Antes do MaxHub, a operação estava espalhada entre WhatsApp, redes sociais e marketplaces, sem um sistema central. O MaxHub centraliza:

- Catálogo de produtos com preços diferenciados por tipo de cliente (A/B/C)
- Geração de orçamento via WhatsApp (Landing Page)
- Cadastro de clientes, pedidos, categorias, fornecedores, usuários
- Controle financeiro básico (lançamentos, fluxo de caixa)
- CRM com cadência de contatos configurável por cliente
- Agenda de contatos, romaneio de compras, rota de entrega

### 1.2 Canais de Venda

```
Landing Page própria | WhatsApp | Instagram | Facebook
Mercado Livre | Shopee | TikTok Shop | Atendimento presencial
```

### 1.3 Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript + Vite, TailwindCSS, React Query (TanStack), React Hook Form, Axios |
| Backend | Java 21 + Spring Boot, Spring Security + JWT, JPA + Hibernate, Flyway, Lombok, MapStruct |
| Banco | PostgreSQL (hospedado no Neon) |
| Infra local | Docker + Docker Compose |
| Deploy | Frontend → Vercel · Backend → Railway ou Render |
| Arquitetura | Clean Architecture, REST API, frontend e backend totalmente separados |

### 1.4 Fases do Projeto

| Fase | Status | Escopo |
|---|---|---|
| Fase 1 | **Concluída** | Landing Page + Catálogo + Orçamento via WhatsApp |
| Fase 2 | **Concluída** | Painel Admin completo (login, pedidos, clientes, produtos, fornecedores, usuários, expedição, CRM) |
| Fase 3 | **Concluída** | Financeiro + Relatórios + CRM avançado (cadência, agenda) |

---

## 2. Autenticação e Controle de Acesso

### 2.1 Login

- **Rota frontend:** `/admin/login`
- **Componente:** `LoginPage.tsx`
- **Endpoint backend:** `POST /api/auth/login` (payload: `{email, password}`)
- **Resposta:** JWT token
- O JWT é armazenado no `localStorage` via `AuthContext`
- Se já autenticado ao acessar `/admin/login`, redireciona automaticamente para `/admin`

### 2.2 Roles

| Role | Acesso |
|---|---|
| `ADMIN` | Acesso total a todos os endpoints e telas |
| `VENDEDOR` | Acesso restrito (sem configurações sensíveis) |

- O token JWT embute a role do usuário
- `PrivateRoute` no frontend protege todas as rotas `/admin/*`
- O backend usa `@PreAuthorize` e `SecurityConfig` para distinguir rotas públicas de autenticadas

### 2.3 Sessão

- Expiração automática pelo TTL do JWT
- Botão "Sair" no header chama `logout()` do `AuthContext`, limpa o localStorage e redireciona para `/admin/login`

---

## 3. Layout Administrativo (`AdminLayout`)

**Componente:** `frontend/src/components/layout/AdminLayout.tsx`

O layout envolve todas as rotas `/admin/*` (exceto `/admin/login`). É composto por:

### 3.1 Sidebar (`AdminSidebar`)

Sidebar fixa de 240px à esquerda com logo "CentralMax" e navegação agrupada:

| Grupo | Item | Rota |
|---|---|---|
| OPERAÇÃO | Dashboard | `/admin` |
| OPERAÇÃO | Pedidos | `/admin/pedidos` |
| OPERAÇÃO | Expedição | `/admin/expedicao` (com badge de pedidos ativos) |
| OPERAÇÃO | Romaneio | `/admin/romaneio` |
| OPERAÇÃO | Rota de Entrega | `/admin/rota-entrega` |
| OPERAÇÃO | Agenda | `/admin/agenda` |
| CADASTROS | Produtos | `/admin/produtos` |
| CADASTROS | Categorias | `/admin/categorias` |
| CADASTROS | Clientes | `/admin/clientes` |
| CADASTROS | Fornecedores | `/admin/fornecedores` |
| FINANCEIRO | Financeiro | `/admin/financeiro` |
| FINANCEIRO | Relatórios | `/admin/relatorios` |
| SISTEMA | Usuários | `/admin/usuarios` |

O badge laranja no item "Expedição" mostra o total de pedidos ativos (`notifications.activeOrdersTotal`).

### 3.2 Header

- Exibe o nome do usuário logado
- **Busca global:** botão "🔍 Buscar (Ctrl+K)" dispara evento `globalSearch:open` → componente `GlobalSearch`
- **Sino de notificações (🔔):** badge vermelho com contagem = `newOrders + overdueContacts + schedulesToday`
  - Dropdown com 3 seções:
    1. **Pedidos novos:** lista dos últimos orders com `timeAgo`, link → `/admin/expedicao`
    2. **Contatos de hoje:** lista de até 5 `ContactSchedule` PENDENTE do dia, com nome, motivo, link WhatsApp (💬), link → `/admin/agenda?period=today`
    3. **Contatos em atraso:** lista de clientes com `nextContactDate` vencida, link → `/admin/agenda?period=overdue`

---

## 4. Dashboard

**Componente:** `DashboardPage.tsx`
**Endpoint:** `GET /api/dashboard` (autenticado)
**Service backend:** `DashboardService`

O dashboard é composto de **3 seções** com cards clicáveis (`ClickableCard`). Cada card navega para a lista filtrada ao ser clicado.

### 4.1 Seção Operação (4 cards)

| Card | Valor | Clica em |
|---|---|---|
| Aguardando confirmação | `ordersToConfirm` (status NOVO) | `/admin/pedidos?status=NOVO` |
| Em separação | `ordersToSeparate` (status EM_SEPARACAO) | `/admin/pedidos?status=EM_SEPARACAO` |
| Saíram p/ entrega | `ordersOutForDelivery` (status SAIU_ENTREGA) | `/admin/expedicao` |
| Pedidos hoje | `ordersToday` (criados hoje) | `/admin/pedidos` |

### 4.2 Seção Financeiro (5 cards, exibem moeda R$)

| Card | Valor | Clica em |
|---|---|---|
| Saldo do mês | `saldoMes` (receitas - despesas pagas no mês) | `/admin/financeiro` |
| A receber | `aReceber` (RECEITA PENDENTE total) | `/admin/financeiro?status=PENDENTE&type=RECEITA` |
| Receber hoje | `receivableToday` (RECEITA PENDENTE com due date = hoje) | idem |
| Recebido hoje | `receivedToday` (RECEITA PAGO hoje) | `/admin/financeiro?status=PAGO&type=RECEITA` |
| Títulos vencidos | `overdueFinancial` (contagem RECEITA PENDENTE vencida) | `/admin/financeiro?status=VENCIDO` |

### 4.3 Seção CRM & Cadastros (4 cards)

| Card | Valor | Clica em |
|---|---|---|
| Contatos hoje | `schedulesToday` | `/admin/agenda?period=today` |
| Contatos amanhã | `schedulesTomorrow` | `/admin/agenda?period=tomorrow` |
| Em atraso | `overdueSchedules` | `/admin/agenda?period=overdue` |
| Clientes | `totalCustomers` | `/admin/clientes` |

### 4.4 Como o DashboardService computa os valores

```java
// Todos estes são queries individuais ao banco
activeProducts = productRepository.count(status == ATIVO)
totalCustomers = customerRepository.count()  // inclui inativos
ordersToConfirm = countByStatus(NOVO)
ordersToSeparate = countByStatus(EM_SEPARACAO)
ordersOutForDelivery = countByStatus(SAIU_ENTREGA)
ordersToday = countCreatedBetween(todayStart, todayEnd)
contactsToday = interactionRepository.countScheduledBetween(todayStart, todayEnd)  // legado
overdueContacts = interactionRepository.countOverdue(now)  // legado
saldoMes = sumPaidRECEITA - sumPaidDESPESA no mês corrente
aReceber = sumRECEITA PENDENTE (sem filtro de data)
overdueFinancial = countRECEITA PENDENTE com dueDate < hoje
receivableToday = sumRECEITA PENDENTE com dueDate = hoje
receivedToday = sumRECEITA PAGO hoje
schedulesToday = contactScheduleRepository.countByScheduledDateAndStatus(hoje, PENDENTE)
schedulesTomorrow = count(amanhã, PENDENTE)
overdueSchedules = count(scheduledDate < hoje, PENDENTE)
```

---

## 5. Módulo Clientes

### 5.1 Lista de Clientes (`CustomersPage`)

**Rota:** `/admin/clientes`
**Endpoint:** `GET /api/customers?search=&status=&origin=&page=0&size=20`

**Filtros disponíveis:**
- Busca por nome, e-mail ou telefone (LIKE case-insensitive)
- Status: PROSPECT | ATIVO | INATIVO
- Origem: LANDING | WHATSAPP | INSTAGRAM | FACEBOOK | MERCADO_LIVRE | SHOPEE | TIKTOK | VISITA | INDICACAO | TELEFONE

**Colunas da tabela:**
- Nome (link para detalhe)
- Telefone
- Tipo/Status (badge colorido: success=ATIVO, danger=INATIVO, neutral=PROSPECT)
- Origem (label humanizado)
- Cadastro (data)
- Ações: [Ver] [Editar] [Desativar]

**Exportação CSV:** inclui Nome, Email, Telefone, Tipo, Status, Origem, Cadastrado em

**Desativar:** soft delete (seta `active = false`), abre modal de confirmação

### 5.2 Formulário de Cliente (`CustomerFormPage`)

**Rotas:** `/admin/clientes/novo` e `/admin/clientes/:id/editar`
**Endpoints:** `POST /api/customers` | `PUT /api/customers/{id}`

**Campos do formulário** (agrupados em seções):

#### Dados principais
| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| Nome | text | Sim | min 2, max 160 chars |
| E-mail | email | Não | formato válido, único no sistema |
| Telefone | text | Não | max 20 chars, ex: `(17) 99999-9999` |
| CPF / CNPJ | text | Não | max 20 chars |
| Tipo | select | Sim | PROSPECT (padrão) / ATIVO / INATIVO |
| Origem | select | Sim (criação) | imutável após cadastro, desabilitado na edição |
| Observações | textarea | Não | max 2000 chars |

#### Endereço
| Campo | Tipo | Detalhes |
|---|---|---|
| CEP | text | max 10 chars; botão "Buscar" chama ViaCEP `https://viacep.com.br/ws/{cep}/json/` |
| Rua / Logradouro | text | max 255, preenchido automaticamente pelo ViaCEP |
| Número | text | max 20; foco automático após CEP ser preenchido |
| Complemento | text | max 100 |
| Bairro | text | max 100, preenchido pelo ViaCEP |
| Cidade | text | max 100, default "São José do Rio Preto" |
| Estado | text | max 2, default "SP" |

**Integração ViaCEP:** ao digitar o CEP e clicar "Buscar" (ou pressionar Enter no campo), faz fetch para `https://viacep.com.br/ws/{cep}/json/` e preenche rua, bairro, cidade e estado automaticamente.

#### Cadência de Contato
| Campo | Tipo | Detalhes |
|---|---|---|
| Intervalo entre contatos (dias) | number | min 1; dica: 7=semanal, 15=quinzenal, 30=mensal |
| Próximo contato | date | para prospects sem cadência fixa |
| Motivo do próximo contato | text | max 255; enviado como `cadenceReason` |

**Comportamento na criação:** se `contactCadenceDays` for informado → `generateNextSchedule()` é chamado (cria ContactSchedule PENDENTE); se apenas `nextContactDate` for informado sem cadência → cria manual schedule com o motivo.

**Comportamento na edição:** se `contactCadenceDays` mudou em relação ao valor anterior → `generateNextSchedule()` é chamado (idempotente: não cria se já existe PENDENTE).

### 5.3 Detalhe do Cliente (`CustomerDetailPage`)

**Rota:** `/admin/clientes/:id`
**Endpoints:** `GET /api/customers/{id}`, `GET /api/customers/{customerId}/schedules`, `GET /api/orders?customerId=`, `GET /api/customers/{customerId}/interactions`

A página tem 3 tabs:

#### Tab Resumo
- Dois cards lado a lado:
  1. **Dados do cliente:** Status (badge colorido), Tipo, Origem, Telefone, E-mail, CPF/CNPJ, Cadastrado em
  2. **Cadência de Contato (📅):**
     - Se sem cadência: mensagem "Sem cadência configurada." + botão "Agendar Manualmente"
     - Se com cadência: exibe Intervalo (`cadenceLabel`), Próximo contato (data, vermelho se `isContactDue`), Último contato
     - Se há ContactSchedule PENDENTE: botão "Registrar Contato Agora" + "Agendar Manualmente"
     - Se sem PENDENTE: botão "Agendar Manualmente"
- Card "Observações" (se existir) — ocupa 2 colunas

**Modais no Resumo:**
- **Registrar Contato:** textarea de observações → `PATCH /api/schedules/{id}/complete` → ao retornar `nextContactDate`, exibe banner verde "Contato registrado! Próximo agendado para DD/MM/YYYY"
- **Agendar Manualmente:** date (obrigatório) + motivo → `POST /api/customers/{id}/schedules`

#### Tab Pedidos
- Card de resumo: total de pedidos, total gasto (R$), dias desde última compra
- Tabela de pedidos: Nº Pedido, Data, Itens (contagem), Total, Status (badge), link "Ver pedido →"

#### Tab Histórico
- Formulário para registrar nova interação: tipo (LIGACAO/WHATSAPP/EMAIL/REUNIAO/VISITA/OUTROS), agendamento (datetime-local, opcional), anotação (textarea)
- Lista de interações salvas com: tipo (badge), data criação, agendamento (se houver), anotação, botão ✕ para deletar

### 5.4 Regras de Negócio — Clientes

- **Status padrão:** PROSPECT ao criar
- **Origem imutável:** o campo é desabilitado na edição e não enviado ao backend; o backend ignora qualquer mudança de origin
- **Email único:** validado incluindo clientes inativos (`existsByEmail` sem filtro de active)
- **Soft delete:** `active = false`; clientes inativos não aparecem na listagem mas existem no banco
- **Cadência auto-chaining:** ao completar um ContactSchedule, se `contactCadenceDays != null`, o próximo é criado automaticamente em `scheduledDate + cadenceDays`
- **`isContactDue`:** computado em `CustomerMapper` → `nextContactDate <= LocalDate.now()`
- **`cadenceLabel`:** computado → `"A cada X dia(s)"`

---

## 6. Módulo Pedidos

### 6.1 Lista de Pedidos (`OrdersPage`)

**Rota:** `/admin/pedidos`
**Endpoint:** `GET /api/orders?status=&search=&page=0&size=50`

**Filtros:** tabs de status + campo de busca (nº pedido ou nome do cliente)

**Tabs de status:**
```
Todos | Novos | Confirmados | Em Separação | Saíram p/ Entrega | Entregues | Concluídos | Cancelados
```

**Colunas:**
- Nº Pedido (link para detalhe, fonte monospace)
- Cliente (nome)
- Status (badge)
- Financeiro (mini badge: Pago=verde / Vencido=vermelho / Pendente=âmbar / Sem título=neutro)
- Total (R$)
- Data (criação)
- Ações

**Ações por pedido:**
| Ação | Condição |
|---|---|
| Ver | Sempre |
| Editar | Apenas NOVO ou CONFIRMADO |
| WhatsApp (💬) | Apenas se cliente tem telefone |
| Avançar → próximo status | Enquanto não for CONCLUIDO/CANCELADO |
| Duplicar | Sempre |
| Cancelar | Enquanto não for CONCLUIDO/CANCELADO |
| Excluir | Apenas NOVO ou CANCELADO |

**Mensagem WhatsApp gerada:**
```
Olá {customerName}! 😊
Seu pedido #{orderNumber} está com status: {statusLabel}.

📦 Itens:
• {productName} x{qty} — R$ {subtotal}

Total: R$ {total}

Qualquer dúvida estamos à disposição!
```
Enviada via `https://api.whatsapp.com/send?phone=55{phone}&text={msg_encoded}`

### 6.2 Fluxo de Status dos Pedidos

```
NOVO → CONFIRMADO → EM_SEPARACAO → SAIU_ENTREGA → ENTREGUE → CONCLUIDO
          ↓ (qualquer estado, exceto CONCLUIDO/CANCELADO)
       CANCELADO
```

**Regras de transição (backend `OrderService.validateStatusTransition`):**
- Só é permitido avançar um passo por vez na ordem acima
- CANCELADO pode ser aplicado a partir de qualquer status não-terminal
- Pedido CONCLUIDO ou CANCELADO não pode ser cancelado

**Efeitos colaterais por mudança de status:**
| Transição | Efeito |
|---|---|
| → CONFIRMADO | Cria `FinancialEntry` (RECEITA, PENDENTE) + calcula `dueDate` |
| → ENTREGUE (com NA_ENTREGA) | Atualiza `dueDate` do lançamento financeiro para hoje |
| → CONCLUIDO | Marca lançamento financeiro como PAGO |

**Cálculo de `dueDate` por condição de pagamento:**
| Condição | `dueDate` |
|---|---|
| A_VISTA | Hoje |
| NA_ENTREGA | null (até ENTREGUE) |
| TRINTA_DIAS | Hoje + 30 dias |
| SESSENTA_DIAS | Hoje + 60 dias |
| NOVENTA_DIAS | Hoje + 90 dias |

### 6.3 Formulário de Pedido (`OrderFormPage`)

**Rotas:** `/admin/pedidos/novo` e `/admin/pedidos/:id/editar`
**Endpoints:** `POST /api/orders` | `PUT /api/orders/{id}`

**Seção Cliente** (dois modos via radio):
- **Cliente cadastrado:** campo de busca (min 2 chars → pesquisa via `GET /api/customers?search=`), mostra lista dropdown, ao selecionar exibe nome + telefone + tipo de preço sendo aplicado
- **Pedido avulso:** campos Nome* e Telefone (sem vínculo com customer cadastrado)
- Pre-carregamento: se URL contém `?customerId=`, busca e seleciona automaticamente esse cliente

**Seção Itens do pedido:**
- Filtro de texto para produtos + dropdown de seleção
- Campo Qtd (number, min 1)
- Campo Desc % (number, 0–100, step 0.5)
- Botão "Adicionar"
- Tabela de cart: Produto, Qtd, Unit. (preço sem desconto), Desc%, Subtotal (preço com desconto × qtd), botão Remover
- Desconto é editável inline na tabela
- Total calculado em tempo real: `Σ applyDiscount(unitPrice, discountPercent) * quantity`
- **Preço automático:** ao selecionar produto, aplica o preço do tipo do cliente selecionado (A/B/C); se trocar de cliente, os preços do carrinho são recalculados

**Seção Condição de pagamento** (radio buttons):
```
NA_ENTREGA (padrão) | A_VISTA | TRINTA_DIAS | SESSENTA_DIAS | NOVENTA_DIAS
```

**Seção Observações:** textarea (opcional)

**Edição de pedido:** carrega dados do pedido existente via `GET /api/orders/{id}`, popula todo o formulário. Só disponível para NOVO e CONFIRMADO.

### 6.4 Detalhe do Pedido (`OrderDetailPage`)

**Rota:** `/admin/pedidos/:id`
**Endpoint:** `GET /api/orders/{id}`

Layout:
- Header: breadcrumb "← Pedidos", título "Pedido #CM-XXXX-YYYY", status badge, botões [Editar pedido] [💬 WhatsApp] [Duplicar pedido]
- Card Cliente: nome, telefone, link "Ver cadastro do cliente →"
- Card Informações: Criado em, Última atualização, Condição de pagamento, Vencimento, Status financeiro, Total
  - Link "Ver no financeiro →" se existe lançamento
- Card Observações (se houver)
- Tabela de itens: Produto, Qtd, Preço unit., Desconto, Subtotal + Total
- Botões de ação no rodapé: [Avançar para {próximo status}] [Cancelar pedido]

### 6.5 Regras de Negócio — Pedidos

- **Número de pedido:** formato `CM-{ANO}-{SEQ:4d}`, ex: `CM-2026-0001`. Sequência gerada via `orderRepository.nextOrderNumber()` (select de sequence no banco)
- **Pelo menos 1 item:** pedido sem item não pode ser salvo (validação no frontend)
- **Preço capturado no momento:** o `unitPrice` é persistido no `order_item`; se o preço do produto mudar depois, o pedido não é afetado
- **Stock movements:** a cada pedido criado/duplicado, uma `StockMovement` tipo `SAIDA` é gerada para cada item (rastreabilidade, sem validação de saldo)
- **Edição restrita:** apenas NOVO e CONFIRMADO; na edição, os items são completamente reconstruídos (clear + rebuild)
- **Exclusão lógica:** `active = false`; pedidos inativos não aparecem em nenhuma listagem

### 6.6 Números de Pedido — Geração

O backend usa uma sequence SQL (provavelmente `order_number_seq`) consultada via JPQL nativo. O formato final é `CM-{YEAR}-{seq padded 4}`.

---

## 7. Central de Expedição (`ExpedicaoPage`)

**Rota:** `/admin/expedicao`
**Endpoint:** `GET /api/orders/board`

**Kanban board** com 5 colunas fixas:

```
| NOVO | CONFIRMADO | EM SEPARAÇÃO | SAIU P/ ENTREGA | ENTREGUE |
```

- Cada coluna mostra o número de pedidos em seu header
- Auto-refresh a cada 60 segundos (`refetchInterval: 60_000`)
- Timestamp "Atualizado há Xs" no header + botão "↻ Atualizar"
- `getBoard()` busca ordens com status `[NOVO, CONFIRMADO, EM_SEPARACAO, SAIU_ENTREGA, ENTREGUE]`

**Card de pedido:**
- Número do pedido (primary)
- Nome do cliente (truncado)
- Contagem de itens + Total (R$)
- Tempo decorrido desde criação (`timeAgo`)
- Botão "Avançar →" (avança um status; não disponível em ENTREGUE)
- Link "Ver detalhes" (abre em nova aba)

**Regra de avanço:** não avança para CONCLUIDO pelo board (só pelo detalhe do pedido ou lista de pedidos).

---

## 8. Romaneio de Compras (`RomaneioPage`)

**Rota:** `/admin/romaneio`
**Endpoint:** `GET /api/orders/purchase-list?statuses=CONFIRMADO,EM_SEPARACAO`

**Objetivo:** lista consolidada de produtos a comprar dos fornecedores para atender os pedidos em andamento.

**Filtro de status** (checkboxes): CONFIRMADO e/ou EM_SEPARACAO (padrão: ambos selecionados)

**Botão "Gerar Romaneio":** dispara a query.

**Resultado:**
- Cabeçalho: "Gerado em DD/MM/YYYY HH:MM · X pedido(s) · Y produto(s) distintos"
- Tabela expandível:
  | SKU | Produto | Qtd Total | Pedidos |
  | `—` | Nome do produto | **soma de qtds** | "N pedido(s)" |
  - Clicando na linha, expande e mostra sub-linhas com `#orderNumber — customerName` e qtd individual

**Exportação CSV:** colunas SKU, Produto, Qtd Total, Pedidos

**Impressão:** `window.print()` → CSS `print:border-none` oculta bordas

**Backend logic (`OrderService.getPurchaseList`):**
1. Busca todos os pedidos com status nos filtros + seus itens (JOIN FETCH)
2. Agrupa por `productId` usando `LinkedHashMap` (preserva ordem de inserção)
3. Soma quantidades por produto
4. Retorna lista de `PurchaseListItemResponse` com refs dos pedidos originais

---

## 9. Rota de Entrega (`DeliveryRoutePage`)

**Rota:** `/admin/rota-entrega`
**Endpoint:** `GET /api/orders/delivery-route?date=YYYY-MM-DD&statuses=SAIU_ENTREGA`

**Objetivo:** visualizar os pedidos que saíram para entrega em uma data específica e montar rota no Google Maps.

**Filtro:** seletor de data (padrão: hoje)

**Botão "Ver rota":** dispara a query.

**Resultado:**
- Warning se alguma parada está sem endereço cadastrado
- Tabela: # (sequência), Pedido (nº), Cliente (nome + telefone), Endereço (montado do cadastro), Itens (resumo), [💬] WhatsApp
- Botão "Abrir Rota no Google Maps (N paradas)"

**URL do Google Maps gerada:**
```
https://www.google.com/maps/dir/?api=1
  &origin=São+José+do+Rio+Preto%2C+SP
  &destination={último_endereço_encoded}
  &waypoints={endereço1}|{endereço2}|...
  &travelmode=driving
```

**Construção do endereço completo para o Maps:**
```
{addressStreet}, {addressNumber}, {addressNeighborhood}, {addressCity}, {addressState}
```
Pedidos sem endereço cadastrado são excluídos da URL mas aparecem na tabela com aviso "Sem endereço".

**Backend logic (`OrderService.getDeliveryRoute`):**
- Filtra por data (createdAt entre `date 00:00 UTC` e `date+1 00:00 UTC`)
- Para cada pedido, monta display address (para tabela) e full address (para Maps)
- Prioriza campos individuais de endereço (`addressStreet`, etc.); fallback para campo legado `address`
- Última parada da lista = destino; demais = waypoints

---

## 10. Agenda de Contatos (`AgendaPage`)

**Rota:** `/admin/agenda` (aceita `?period=today|tomorrow|week|month|overdue`)
**Endpoint:** `GET /api/agenda/schedules?period=today&customerId=`

### 10.1 Tabs

| Tab | Period | Descrição |
|---|---|---|
| Hoje | `today` | ContactSchedules PENDENTE com `scheduledDate = hoje` |
| Amanhã | `tomorrow` | `scheduledDate = hoje + 1` |
| Esta Semana | `week` | `scheduledDate` entre hoje e hoje + 6 |
| Mês | `month` | `scheduledDate` entre hoje e hoje + 29 |
| Em Atraso | `overdue` | `scheduledDate < hoje` AND status PENDENTE |

A tab "Em Atraso" exibe badge vermelho com contagem quando há itens.

### 10.2 Card de Agendamento

Cada item exibe:
- Nome do cliente (link → `/admin/clientes/{id}`) + badge de status (Prospect=azul, Ativo=verde, Inativo=cinza)
- Badge "Xd em atraso" (só na tab overdue)
- Motivo do contato
- Data (para week/month) + telefone
- Ações: [💬 WhatsApp] [Registrar] [Ver Cliente] [Cancelar]

**WhatsApp:** abre `https://api.whatsapp.com/send?phone=55{phone}&text=Olá {name}! Passando para dar um retorno, estamos à disposição!`

### 10.3 Modal "Registrar Contato"

- Textarea de observações (opcional)
- Chama `PATCH /api/schedules/{id}/complete` com `{notes}`
- Ao fechar, se response.nextContactDate existe, exibe banner: "Contato registrado! Próximo agendado para DD/MM/YYYY"
- Invalida query `['agenda']` → recarrega a lista

### 10.4 Cancelar

- Chama `PATCH /api/schedules/{id}/cancel` (sem body)
- Remove o item da lista

### 10.5 Agrupamento por data (week/month)

```typescript
function groupByDate(items): Record<string, ContactSchedule[]>
// Retorna objeto com datas como chaves, itens do dia como valores
// Renderizado com header "DD/MM/YYYY (N contato(s))" por grupo
```

### 10.6 Deep-linking

A URL `?period=X` é lida no mount via `useSearchParams()` e define o tab inicial. Isso permite que cards do Dashboard naveguem diretamente para a tab correta.

---

## 11. Módulo Produtos

### 11.1 Lista de Produtos (`ProductsPage`)

**Rota:** `/admin/produtos`
**Endpoint:** `GET /api/products/admin?search=&status=&categoryId=&page=0&size=20`

**Filtros:** busca por nome, filtro de categoria, filtro de status (ATIVO/INATIVO)

**Colunas:** Nome, Categoria, Preço A, Preço B, Preço C, Fotos (contagem), Status, Ações

**Ações:**
| Ação | Comportamento |
|---|---|
| Editar | Navega para `/admin/produtos/{id}/editar` |
| Copiar | Abre modal de duplicação |
| Desativar | Modal de confirmação → `DELETE /api/products/{id}` (soft delete) |
| Reativar | `POST /api/products/{id}/activate` |

**Modal de duplicação:** pergunta "Copiar as fotos também?" com 3 botões: Cancelar / Não, só o produto / Sim, copiar fotos. Após duplicar, redireciona para edição da cópia.

### 11.2 Formulário de Produto (`ProductFormPage`)

**Rotas:** `/admin/produtos/novo` e `/admin/produtos/:id/editar`
**Endpoints:** `POST /api/products` | `PUT /api/products/{id}`

Layout desktop: 2 colunas — formulário à esquerda, preview do card à direita (fixo com `sticky top-6`).

**Seção Dados do produto:**
| Campo | Tipo | Regras |
|---|---|---|
| SKU | text | max 50 chars |
| Nome | text | obrigatório, min 3, max 160 |
| Descrição | textarea | opcional |
| Categoria | select | obrigatório, carrega de `/api/categories` |
| Fornecedor | select | opcional, carrega de `/api/suppliers` |
| URL da imagem (legado) | url | max 500 chars; preferir upload de foto |

**Seção Precificação (bidirecional):**
- Campo "Preço de Compra (R$)": ao alterar, recalcula Preço A/B/C usando as margens
- Campo "Qtd. Mínima": inteiro, min 1
- Para cada nível (A, B, C): campo de % Margem + campo de Preço de Venda
  - Alterar preço → recalcula margem; alterar margem → recalcula preço
  - Fórmulas: `preco = custo * (1 + margem/100)` / `margem = (preco/custo - 1) * 100`
- Validação de ordem: `A ≤ B ≤ C` — exibe aviso âmbar se violada (não bloqueia)

**Seção Fotos** (só na edição): componente `ProductPhotoUpload` — upload de imagens, reordenação, exclusão.

**Seção Variações** (só na edição): componente `ProductVariationEditor` — pares chave→valor (ex: "Cor → Azul").

**Preview lateral:** atualiza em tempo real com nome, descrição, preço C, categoria, imagem.

**Fluxo criação:**
1. Salva produto → redireciona para `/admin/produtos/{id}/editar`
2. Na edição, aparecem seções Fotos e Variações

### 11.3 Regras de Negócio — Produtos

- **3 preços obrigatórios:** A (atacado/menor), B (intermediário), C (varejo/maior)
- **Ordem de preços:** A ≤ B ≤ C (aviso, não bloqueante)
- **Soft delete:** status = INATIVO, nunca exclusão física
- **Reativação:** endpoint dedicado `POST /api/products/{id}/activate`
- **Preço exibido no catálogo público:** sempre Preço C para visitante anônimo

---

## 12. Módulo Categorias (`CategoriesPage`)

**Rota:** `/admin/categorias`
**Endpoints:** `GET /api/categories/admin` | `POST /api/categories` | `PUT /api/categories/{id}` | `DELETE /api/categories/{id}` | `POST /api/categories/{id}/activate`

**Tabela:** Nome, Slug (auto-gerado, exibido em monospace), Status (Ativa/Inativa), Ações

**Modal de criação/edição:** único campo "Nome" (min 2, max 80)

**Soft delete:** `active = false`; desativação confirmada via modal; reativação inline

**Slug:** gerado automaticamente pelo backend a partir do nome (não editável pelo usuário)

---

## 13. Módulo Fornecedores (`SuppliersPage`)

**Rota:** `/admin/fornecedores`
**Endpoints:** `GET /api/suppliers` | `POST /api/suppliers` | `PUT /api/suppliers/{id}` | `DELETE /api/suppliers/{id}` | `POST /api/suppliers/{id}/activate`

**Tabela:** Nome, Contato, Email, Telefone, Status, Ações

**Modal de criação/edição:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome | text | Sim |
| Nome do contato | text | Não |
| Email | email | Não |
| Telefone | text | Não |
| Observações | textarea | Não |

**Soft delete + reativação** (mesmo padrão de Categorias)

---

## 14. Módulo Financeiro (`FinancialPage`)

**Rota:** `/admin/financeiro`
**Endpoints:** `GET /api/financial`, `POST /api/financial`, `PUT /api/financial/{id}`, `PATCH /api/financial/{id}/pay`, `DELETE /api/financial/{id}`, `GET /api/financial/summary`

### 14.1 Cards de Resumo (5 cards)

| Card | Valor |
|---|---|
| Saldo do Mês | receitas PAGO - despesas PAGO no mês corrente |
| A Receber | soma RECEITA PENDENTE (sem filtro de data) |
| Receitas (mês) | soma RECEITA PAGO no mês |
| Despesas (mês) | soma DESPESA PAGO no mês |
| Vencidos | soma RECEITA PENDENTE com dueDate < hoje |

### 14.2 Filtros

| Filtro | Opções |
|---|---|
| Tipo | RECEITA / DESPESA |
| Status | PENDENTE / VENCIDO / PAGO / CANCELADO |
| Período | De (data) / Até (data) |

"VENCIDO" no filtro é tratado como `status=PENDENTE AND dueDate < hoje` no backend.

### 14.3 Tabela de Lançamentos

Colunas: Descrição, Tipo (badge verde=receita, vermelho=despesa), Vencimento, Valor (colorido), Status, Pedido (nº ou "—"), Ações

**Ações por lançamento:**
| Ação | Condição |
|---|---|
| Receber | status = PENDENTE ou VENCIDO → marca como PAGO + registra `paidAt` |
| Editar | status ≠ PAGO e ≠ VENCIDO |
| Excluir | status ≠ PAGO → exclusão física |

**Modal de criação/edição:** Tipo (RECEITA/DESPESA), Descrição (obrigatória), Valor (R$, obrigatório), Vencimento (obrigatório), Observações

### 14.4 Paginação

20 registros por página; botões "Anterior" / "Próxima" no rodapé da tabela.

### 14.5 Ciclo de Vida Automático

| Evento | Ação |
|---|---|
| Pedido → CONFIRMADO | `createFromOrder()`: cria RECEITA PENDENTE vinculada ao pedido |
| Pedido → ENTREGUE (NA_ENTREGA) | `updateDueDateByOrderId()`: atualiza dueDate para hoje |
| Pedido → CONCLUIDO | `markAsPaidByOrderId()`: marca como PAGO + registra `paidAt` |
| Pedido editado (CONFIRMADO) | `updateAmountByOrderId()`: atualiza valor se ainda PENDENTE |
| Lançamento → PAGO | `paidAt = Instant.now()` |

**Importante:** o backend não marca automaticamente lançamentos como VENCIDO no banco — "VENCIDO" é apenas um estado virtual exibido no frontend quando `status = PENDENTE AND dueDate < hoje`. O filtro "VENCIDO" na listagem faz a query correspondente.

---

## 15. Módulo Relatórios (`ReportsPage`)

**Rota:** `/admin/relatorios`
**Endpoints:** `GET /api/reports/sales?start=&end=` | `GET /api/reports/customers?start=&end=`

### 15.1 Filtro de Período

4 presets:
- **Este mês:** primeiro dia do mês até último dia do mês
- **Últimos 30 dias:** hoje - 29 até hoje
- **Este ano:** 1 jan até 31 dez
- **Personalizado:** date range manual

### 15.2 Tab Vendas

- 3 cards: Total de Pedidos, Receita Total, Ticket Médio
- Gráfico de barras (Recharts `BarChart`): Receita por dia (eixo Y formatado `R$Xk`)
- Tabela Top 5 produtos: nome, quantidade vendida, receita
- Tabela Pedidos por status: status → contagem
- Botão "Exportar CSV" (baixa receita por dia + top produtos)

### 15.3 Tab Clientes

- 2 cards: Total de Clientes, Novos no Período
- Gráfico de pizza por origem (Recharts `PieChart`)
- Gráfico de pizza por status
- Tabela Top 5 clientes: nome, total de pedidos, total gasto

---

## 16. Módulo Usuários (`UsersPage`)

**Rota:** `/admin/usuarios`
**Endpoints:** `GET /api/users` | `POST /api/users` | `PUT /api/users/{id}` | `PATCH /api/users/{id}/password` | `DELETE /api/users/{id}`

**Tabela:** Nome, Email, Role (badge: ADMIN=roxo, VENDEDOR=info), Status, Ações

**Modal criar/editar:**
| Campo | Criação | Edição |
|---|---|---|
| Nome | Obrigatório | Obrigatório |
| Email | Obrigatório | Obrigatório |
| Senha | Obrigatória (min 6) | **Oculta** (use modal separado) |
| Role | VENDEDOR (padrão) / ADMIN | Editável |

**Modal "Redefinir Senha":** nova senha (min 6) → `PATCH /api/users/{id}/password`

**Desativar:** soft delete (`active = false`); usuário perde acesso ao sistema

---

## 17. CRM — Cadência de Contatos

### 17.1 Entidade `ContactSchedule`

```
id         : UUID (PK)
customer   : Customer (ManyToOne lazy)
scheduledDate : LocalDate
reason     : String (max 255)
status     : PENDENTE | REALIZADO | CANCELADO
notes      : Text
completedAt: Instant (null até completar)
createdAt  : Instant
```

**Tabela:** `contact_schedules`
**Índices:** `(customer_id)`, `(scheduled_date)`, `(status, scheduled_date)`

### 17.2 Campos CRM no Customer

```
contactCadenceDays : Integer (null = sem cadência automática)
nextContactDate    : LocalDate
lastContactedAt    : LocalDateTime
```

**Campos computados (CustomerMapper):**
```java
cadenceLabel = "A cada {N} dia(s)"   // null se cadenceDays == null
isContactDue = nextContactDate <= LocalDate.now()
```

### 17.3 Endpoints CRM

| Método | URL | Descrição |
|---|---|---|
| GET | `/api/customers/{id}/schedules` | Lista schedules do cliente (DESC por data) |
| POST | `/api/customers/{id}/schedules` | Cria schedule manual |
| PATCH | `/api/schedules/{id}/complete` | Registra contato realizado |
| PATCH | `/api/schedules/{id}/cancel` | Cancela schedule |
| GET | `/api/agenda/schedules?period=&customerId=` | Agenda filtrada por período |

### 17.4 Auto-encadeamento de Cadência

```
completeSchedule(scheduleId, {notes}):
  1. Schedule → REALIZADO, completedAt = now
  2. customer.lastContactedAt = now
  3. Se customer.contactCadenceDays != null:
     a. nextDate = schedule.scheduledDate + cadenceDays
     b. customer.nextContactDate = nextDate
     c. Cria novo ContactSchedule(nextDate, reason=same, PENDENTE)
  4. Retorna response com nextContactDate
```

```
generateNextSchedule(customer):
  // Chamado ao criar/atualizar customer com cadência
  1. Se há PENDENTE já existente → não faz nada (idempotente)
  2. Senão: date = customer.nextContactDate ?: LocalDate.now()
            Cria ContactSchedule(date, "Contato programado", PENDENTE)
```

### 17.5 Períodos da Agenda (backend)

```java
"today"    → scheduledDate = LocalDate.now()
"tomorrow" → scheduledDate = LocalDate.now() + 1
"week"     → scheduledDate BETWEEN hoje AND hoje + 6
"month"    → scheduledDate BETWEEN hoje AND hoje + 29
"overdue"  → scheduledDate < hoje AND status = PENDENTE
```

---

## 18. Notificações (`NotificationService`)

**Endpoint:** `GET /api/notifications` (chamado pelo hook `useNotifications` no frontend, provavelmente com polling periódico via React Query)

**Response:**

```typescript
{
  newOrders: number,           // contagem de pedidos NOVO
  overdueContacts: number,     // contagem de clientes com nextContactDate vencida (legado)
  activeOrdersTotal: number,   // total pedidos ativos (para badge da sidebar)
  recentOrders: OrderSummaryItem[],     // últimos pedidos novos (para o sino)
  overdueCustomers: CustomerContactItem[], // clientes com contato em atraso (para o sino)
  schedulesToday: number,      // ContactSchedules PENDENTE hoje
  contactsToday: ScheduleItem[] // Até 5 schedules do dia (para o sino)
}
```

---

## 19. Regras de Negócio Consolidadas

### 19.1 Preços por tipo de cliente

- **Tipo A (atacado):** Preço A (menor)
- **Tipo B (intermediário):** Preço B
- **Tipo C (varejo) ou visitante anônimo:** Preço C (maior)
- Tipo é definido no cadastro do cliente, nunca autoatribuído
- Na Landing Page (Fase 1), sem login de cliente, sempre exibe Preço C

### 19.2 Status do cliente

| Status | Significado | Transição |
|---|---|---|
| PROSPECT | Cadastrado, sem pedido | Padrão ao criar |
| ATIVO | Com pelo menos 1 pedido confirmado | Manual ou automático |
| INATIVO | Sem pedidos por período relevante | Manual (automação futura) |

O status **não bloqueia** nenhuma operação no sistema — é apenas informativo.

### 19.3 Origem do cliente

Enum fixo e imutável após cadastro:
```
LANDING | WHATSAPP | INSTAGRAM | FACEBOOK | MERCADO_LIVRE
SHOPEE | TIKTOK | VISITA | INDICACAO | TELEFONE
```

### 19.4 Soft delete — padrão em todas as entidades

Nenhuma entidade é excluída fisicamente do banco. O padrão é `active = false` (clientes, pedidos, produtos, categorias, fornecedores, usuários). Lançamentos financeiros são a exceção — admitem exclusão física, mas somente se status ≠ PAGO.

### 19.5 Unicidade de email

Email de cliente é único no sistema inteiro, incluindo clientes com `active = false`. A validação é feita em `CustomerService.validateEmailUniqueness()`.

### 19.6 Movimentações de estoque

Toda criação/duplicação de pedido gera `StockMovement(SAIDA)` por item. Não há validação de saldo. Serve apenas como histórico para fase futura de controle de estoque.

---

## 20. Fluxo Completo de uma Venda

```
1. Vendedor acessa /admin/pedidos/novo
2. Seleciona o cliente cadastrado (busca por nome/telefone/email)
   → sistema detecta o tipo do cliente (A/B/C) e aplica os preços corretos
3. Adiciona produtos ao carrinho com quantidades e descontos
4. Seleciona condição de pagamento
5. Salva → pedido criado com status NOVO
   → StockMovements (SAIDA) gerados para cada item

6. Na Expedição (/admin/expedicao) ou em /admin/pedidos:
   [NOVO] → clica "Avançar" → status = CONFIRMADO
   → FinancialEntry criado (RECEITA PENDENTE, dueDate calculado)

7. [CONFIRMADO] → "Avançar" → EM_SEPARACAO
   (produto sendo separado para envio)

8. [EM_SEPARACAO] → "Avançar" → SAIU_ENTREGA
   (produto saiu para entrega)

9. Na Rota de Entrega (/admin/rota-entrega):
   → Visualiza pedidos SAIU_ENTREGA do dia
   → Abre Google Maps com rota otimizada
   → Envia WhatsApp para cliente com aviso de entrega

10. [SAIU_ENTREGA] → "Avançar" → ENTREGUE
    → Se condição = NA_ENTREGA: dueDate atualizado para hoje

11. [ENTREGUE] → "Avançar" → CONCLUIDO
    → FinancialEntry marcado como PAGO

12. No Financeiro (/admin/financeiro):
    → Lançamento aparece como PAGO
```

---

## 21. O Que o Sistema Ainda Não Faz

### 21.1 Funcional (identificado mas não implementado)

- **Paginação do lado do servidor nas listagens de clientes e produtos:** o frontend envia `size=50` mas não tem controle de página seguinte
- **Marcação automática de cliente como INATIVO:** baseada em "sem pedidos nos últimos 6 meses" — hoje é 100% manual
- **Marcação automática de lançamento como VENCIDO no banco:** o status VENCIDO existe só na exibição (query por `dueDate < hoje`), nunca é persistido
- **Job de geração automática de schedules:** `generateNextSchedule()` só é chamado ao criar/atualizar cliente; não há scheduler que verifique clientes com cadência vencida sem schedule
- **Login do cliente na Landing Page:** toda a Landing Page usa Preço C; a diferenciação por tipo de cliente (A/B) não está disponível para o consumidor final
- **Restrições visuais por role (VENDEDOR vs ADMIN):** o backend protege endpoints, mas o frontend não oculta menus nem botões com base na role do usuário logado

### 21.2 Técnico

- **Upload de imagens na criação de produto:** o upload de fotos (`ProductPhotoUpload`) só aparece na edição; na criação, só é possível informar URL legado
- **Global Search:** o componente existe mas sua implementação interna não foi lida (busca em quê? quais endpoints?)
- **Interações de clientes (`CustomerInteractionService`):** legado do sistema de histórico (LIGACAO/WHATSAPP/EMAIL/REUNIAO/VISITA/OUTROS) coexiste com o novo sistema de ContactSchedule; os dois ainda são usados em paralelo
- **Validação de CPF/CNPJ:** o campo `document` aceita qualquer texto de até 20 chars; não há validação de formato/dígitos verificadores
- **Rate limiting e audit log:** não implementados
- **Paginação da Agenda:** sem paginação — lista retorna todos os schedules do período

### 21.3 Integrações Futuras

- Pagamento online (sem gateway atualmente)
- Controle de estoque físico com saldo real
- Notificações push/email automáticas
- Multi-canal: sincronização com Mercado Livre/Shopee/etc.

---

## 22. Mapeamento de Endpoints Backend

### Auth
```
POST /api/auth/login           → {email, password} → {token}
GET  /api/auth/me              → {id, name, email, role}
```

### Customers
```
GET    /api/customers          → ?search=&status=&origin=&page=&size=
POST   /api/customers          → CustomerRequest
GET    /api/customers/{id}     → CustomerResponse
PUT    /api/customers/{id}     → CustomerRequest
DELETE /api/customers/{id}     → soft delete
```

### CRM (ContactSchedule)
```
GET    /api/customers/{id}/schedules              → List<ContactScheduleResponse>
POST   /api/customers/{id}/schedules              → ContactScheduleRequest
PATCH  /api/schedules/{id}/complete               → CompleteScheduleRequest {notes}
PATCH  /api/schedules/{id}/cancel                 → (sem body)
GET    /api/agenda/schedules?period=&customerId=  → List<ContactScheduleResponse>
```

### Customer Interactions (legado)
```
GET    /api/customers/{id}/interactions     → List
POST   /api/customers/{id}/interactions     → {type, notes, scheduledAt}
DELETE /api/customers/{id}/interactions/{iid}
```

### Orders
```
GET    /api/orders             → ?status=&search=&customerId=&page=&size=
POST   /api/orders             → OrderRequest
GET    /api/orders/{id}        → OrderResponse
PUT    /api/orders/{id}        → OrderRequest (NOVO/CONFIRMADO only)
PATCH  /api/orders/{id}/status → {status}
DELETE /api/orders/{id}        → soft delete (NOVO/CANCELADO only)
POST   /api/orders/{id}/duplicate → OrderResponse
GET    /api/orders/board       → List<OrderResponse> (5 statuses)
GET    /api/orders/purchase-list?statuses= → PurchaseListResponse
GET    /api/orders/delivery-route?date=&statuses= → DeliveryRouteResponse
```

### Products
```
GET    /api/products           → ?categoryId=&search= (público, retorna displayPrice=C)
GET    /api/products/admin     → ?search=&status=&categoryId=&page=&size=
POST   /api/products           → ProductRequest
GET    /api/products/{id}/admin → ProductAdmin
PUT    /api/products/{id}      → ProductRequest
DELETE /api/products/{id}      → soft delete
POST   /api/products/{id}/activate
POST   /api/products/{id}/duplicate?copyPhotos=true|false
```

### Categories
```
GET    /api/categories         → List (públicas, ativas)
GET    /api/categories/admin   → List (todas, incluindo inativas)
POST   /api/categories         → {name}
PUT    /api/categories/{id}    → {name}
DELETE /api/categories/{id}    → soft delete
POST   /api/categories/{id}/activate
```

### Suppliers
```
GET    /api/suppliers          → List
POST   /api/suppliers          → SupplierRequest
PUT    /api/suppliers/{id}     → SupplierRequest
DELETE /api/suppliers/{id}     → soft delete
POST   /api/suppliers/{id}/activate
```

### Financial
```
GET    /api/financial          → ?type=&status=&startDate=&endDate=&page=&size=
GET    /api/financial/summary  → FinancialSummaryResponse
POST   /api/financial          → FinancialEntryRequest
PUT    /api/financial/{id}     → FinancialEntryRequest
PATCH  /api/financial/{id}/pay → (sem body)
DELETE /api/financial/{id}     → exclusão física (se não PAGO)
```

### Reports
```
GET    /api/reports/sales?start=&end=      → SalesReportResponse
GET    /api/reports/customers?start=&end=  → CustomerReportResponse
```

### Dashboard & Notifications
```
GET    /api/dashboard          → DashboardResponse
GET    /api/notifications      → NotificationSummaryResponse
```

### Users
```
GET    /api/users              → List<UserResponse>
POST   /api/users              → UserRequest
PUT    /api/users/{id}         → UserRequest
PATCH  /api/users/{id}/password → {password}
DELETE /api/users/{id}         → soft delete
```

---

## 23. Migrações Flyway (ordem)

| Versão | Arquivo | Conteúdo |
|---|---|---|
| V1 | `V1__create_initial_schema.sql` | Schema completo inicial: products, categories, suppliers, customers, orders, order_items, stock_movements, users |
| V2 | `V2__seed_admin_user.sql` | Usuário admin inicial |
| V3 | `V3__seed_initial_products.sql` | Fornecedor "Emplay" + categoria "Sacos Plásticos" + 4 produtos PEBD |
| V4 | `V4__alter_customers_add_active_notes.sql` | Colunas `notes` e `active` em customers; `phone` e `document` opcionais |
| V5–V17 | Diversas | Pedidos, financeiro, relatórios, expedição, foto de produto, variações, endereço do cliente, etc. |
| V18 | `V18__add_contact_cadence.sql` | Colunas CRM em customers (`contact_cadence_days`, `next_contact_date`, `last_contacted_at`) + tabela `contact_schedules` + 3 índices |

**Regra crítica:** migrações já aplicadas são **imutáveis**. Qualquer alteração de schema deve ser uma nova migration V{N+1}.

---

## 24. Configuração e Deploy

### 24.1 Variáveis de Ambiente (Frontend)

```
VITE_API_URL=https://...    # URL base do backend
VITE_WHATSAPP_NUMBER=5517991660410
```

### 24.2 Variáveis de Ambiente (Backend)

```
DATABASE_URL=jdbc:postgresql://...  # Neon PostgreSQL
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
JWT_SECRET=...
JWT_EXPIRATION=...
STORAGE_...=...  # R2 (Cloudflare) para upload de fotos
```

### 24.3 Compilação Backend

```bash
# JDK compatível com Lombok: ms-17.0.19
# Maven wrapper via ~/.m2/wrapper/dists/apache-maven-3.9.15-bin/.../mvn.cmd
JAVA_HOME=/c/Users/jose.garcia/.jdks/ms-17.0.19 mvn.cmd clean package -DskipTests
```

### 24.4 Notas de Infraestrutura

- **JDK 26 é incompatível com Lombok** — usar JDK 17 (ms-17.0.19) para compilar
- Fotos de produto são armazenadas no Cloudflare R2 (`R2StorageService`)
- PostgreSQL no Neon (cloud); Flyway aplica migrações automaticamente no startup

---

## 25. Decisões de Design Relevantes

1. **WhatsApp via `api.whatsapp.com`** (não `wa.me`): `wa.me` tem um bug de redirect que corrompe emojis. Usado em todos os links de WhatsApp do sistema.

2. **Preço capturado no pedido:** `order_item.unit_price` e `order_item.discount_percent` são persistidos no momento da criação, protegendo histórico de alterações de preço futuras.

3. **Origem do cliente imutável:** implementado no backend (campo nunca atualizado em `CustomerService.update()`) e no frontend (campo desabilitado na edição + aviso).

4. **CRM idempotente:** `generateNextSchedule()` verifica se já existe PENDENTE antes de criar novo — evita duplicatas se chamado múltiplas vezes.

5. **Rota de entrega sem estoque:** a lógica de rota de entrega usa `createdAt` do pedido, não uma data de entrega específica. Pedidos SAIU_ENTREGA no dia são incluídos.

6. **Deep-link via `?period=`:** A AgendaPage lê o período inicial da URL para que cards do Dashboard possam navegar diretamente para a tab correta.

7. **Número de pedido sequencial por ano:** `CM-{YEAR}-{SEQ:0004d}` — a sequência provavelmente recomeça ou é contínua (depende da implementação da sequence no banco).

8. **Preço de compra e margem:** calculados no frontend apenas — o banco persiste apenas os 3 preços de venda (A, B, C) e o `purchase_price`. Margem é derivada em runtime.
