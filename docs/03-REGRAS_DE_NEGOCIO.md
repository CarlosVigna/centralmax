# 03 — Regras de Negócio

## Preços por tipo de cliente

Todo produto possui **3 preços simultâneos**:

- **Preço A** — cliente atacado / grande volume (menor preço).
- **Preço B** — cliente intermediário / recorrente.
- **Preço C** — cliente final / visitante (maior preço, é o preço "de balcão").

Regras:
- Os 3 preços são obrigatórios no cadastro do produto e devem ser maiores que zero.
- `Preço A <= Preço B <= Preço C`. O sistema deve validar essa ordem ao salvar o produto (não é estritamente bloqueante de negócio, mas é a expectativa padrão — exibir aviso se violada).
- O preço exibido no catálogo depende do **tipo de cliente logado**:
  - Cliente do tipo A vê e paga Preço A.
  - Cliente do tipo B vê e paga Preço B.
  - Cliente do tipo C ou visitante anônimo (não logado) vê e paga Preço C.
- O tipo de cliente é definido no cadastro do cliente (Painel Admin), não é autoatribuído.
- Na Fase 1, sem login de cliente na Landing Page, todo visitante vê o **Preço C**. Diferenciação por tipo de cliente entra em uso pleno quando houver autenticação de cliente ou atendimento direto pelo vendedor no Painel Admin (Fase 2).

## Classificação de clientes

Todo cliente tem um **status**:

- **Prospect** — cadastrado mas ainda não fechou nenhum pedido.
- **Ativo** — já fechou ao menos 1 pedido e está em relacionamento comercial corrente.
- **Inativo** — já foi cliente, mas sem pedidos em um período relevante (definição de "período relevante" é parametrizável; sugestão inicial: sem pedidos nos últimos 6 meses), ou marcado manualmente como inativo.

Regras:
- Todo cliente novo entra como **Prospect** por padrão.
- A transição para **Ativo** pode ocorrer automaticamente ao confirmar o primeiro pedido, ou manualmente pelo vendedor/admin.
- A transição para **Inativo** é manual na Fase 2 (não há job automático ainda). Pode ser automatizada em fase futura.
- O status não bloqueia nenhuma ação no sistema — é apenas informativo/segmentação, usado para relatórios e priorização comercial.

## Origem do cliente

Toda vez que um cliente é cadastrado, deve ser registrada a **origem** do contato, escolhida entre um enum fixo:

```
LANDING, WHATSAPP, INSTAGRAM, FACEBOOK, MERCADO_LIVRE, SHOPEE, TIKTOK, VISITA, INDICACAO, TELEFONE
```

Regras:
- A origem é obrigatória no cadastro do cliente.
- A origem é definida uma única vez no primeiro contato e não deve ser alterada depois (representa "como o cliente chegou", é histórico).
- Pedidos também registram sua própria origem (que pode ser diferente da origem do cliente, ex.: cliente veio do Instagram mas fez este pedido específico por telefone).

## Pagamento

- **Não há pagamento online na Fase 1.** O MaxHub não processa pagamento, não integra gateway de pagamento e não armazena dados de cartão.
- Toda negociação de preço final, forma de pagamento e prazo é feita manualmente pelo vendedor via WhatsApp, fora do sistema.
- O MaxHub apenas gera o **orçamento inicial** (lista de produtos, quantidades e preços de tabela) — o valor final do pedido pode ser ajustado manualmente pelo vendedor ao registrar o pedido no Painel Admin (Fase 2).

## Fluxo de orçamento via WhatsApp (Fase 1)

1. Visitante navega no catálogo da Landing Page e adiciona produtos ao carrinho de orçamento.
2. Visitante revisa o carrinho (pode ajustar quantidades, remover itens).
3. Visitante informa nome (e opcionalmente telefone) antes de finalizar.
4. Ao clicar em "Enviar orçamento via WhatsApp":
   - O sistema monta uma mensagem de texto formatada contendo: nome do cliente, lista de produtos com quantidade e preço unitário (Preço C), valor total estimado, e um identificador/timestamp do orçamento.
   - O sistema abre o WhatsApp (via link `https://wa.me/<numero>?text=<mensagem_codificada>`) direcionado ao número oficial da Central Max Embalagens, com a mensagem pré-preenchida.
   - O visitante revisa e envia a mensagem manualmente pelo WhatsApp (o sistema não envia a mensagem automaticamente).
5. Após o envio (clique confirmado), o carrinho é limpo do localStorage.

Formato sugerido da mensagem:

```
Olá! Gostaria de um orçamento:

1x Caixa de Papelão 30x30x30 — R$ 12,90
2x Fita Adesiva Transparente 48mm — R$ 8,50

Total estimado: R$ 29,90

Nome: João da Silva
Orçamento gerado pelo site em 29/06/2026 14:32
```

## Movimentações de produto sem estoque físico

Mesmo sem controle de estoque físico na Fase 1/2, toda confirmação de pedido deve gerar um registro em `stock_movements` do tipo **SAIDA**, referenciando o produto, a quantidade e o pedido de origem.

Por quê: isso cria o histórico de movimentações desde o início, para que a Fase 3 (ou uma fase futura de estoque físico) possa calcular saldo retroativo sem precisar de migração de dados de pedidos antigos. O saldo de estoque em si **não é exibido nem validado** nas Fases 1-3 — é apenas log de rastreabilidade.

## Validações esperadas por entidade

### Cliente (`customers`)
- Nome: obrigatório, mínimo 3 caracteres.
- Documento (CPF/CNPJ): obrigatório, único no sistema, formato validado (CPF 11 dígitos / CNPJ 14 dígitos).
- Telefone: obrigatório, formato brasileiro (DDD + número).
- E-mail: opcional, formato válido se informado.
- Tipo de cliente (A/B/C): obrigatório, padrão "C" na criação.
- Status: obrigatório, padrão "PROSPECT" na criação.
- Origem: obrigatória, não editável após criação.

### Produto (`products`)
- Nome: obrigatório, mínimo 3 caracteres.
- Categoria: obrigatória, deve referenciar categoria existente.
- Preço A, B, C: obrigatórios, numéricos, maiores que zero.
- Status: obrigatório, padrão "ATIVO" na criação. Exclusão é sempre lógica (campo de status), nunca exclusão física do banco.
- Fornecedor: opcional no cadastro mínimo, recomendado para rastreabilidade de compra.

### Categoria (`categories`)
- Nome: obrigatório, único, mínimo 2 caracteres.

### Fornecedor (`suppliers`)
- Nome/Razão social: obrigatório.
- Documento (CNPJ): opcional, mas único se informado.
- Telefone ou e-mail de contato: ao menos um dos dois é obrigatório.

### Pedido (`orders`)
- Cliente: obrigatório, deve referenciar cliente existente.
- Ao menos 1 item (`order_items`): obrigatório — pedido sem item não pode ser salvo.
- Status: obrigatório, padrão "ORCAMENTO" na criação.
- Origem: obrigatória.
- Total: calculado automaticamente a partir da soma dos itens (quantidade × preço unitário), nunca digitado manualmente.

### Item de pedido (`order_items`)
- Produto: obrigatório, deve referenciar produto existente.
- Quantidade: obrigatória, inteiro maior que zero.
- Preço unitário: obrigatório, capturado no momento da criação do pedido (não recalculado retroativamente se o preço do produto mudar depois).

### Movimentação de produto (`stock_movements`)
- Produto: obrigatório.
- Tipo: obrigatório, enum (`ENTRADA`, `SAIDA`).
- Quantidade: obrigatória, inteiro maior que zero.
- Pedido de origem: opcional (movimentações manuais podem não ter pedido vinculado).
