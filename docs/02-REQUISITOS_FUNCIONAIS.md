# 02 — Requisitos Funcionais

Convenção de ID: `RF-<MÓDULO>-<NÚMERO>`. Prioridade: **Alta** (bloqueia a fase), **Média** (importante, mas a fase funciona sem), **Baixa** (desejável, pode ficar para depois).

## Módulo: Landing Page

| ID | Descrição | Prioridade | Fase |
|---|---|---|---|
| RF-LP-01 | Exibir página institucional com apresentação da Central Max Embalagens (quem é, o que vende, diferenciais). | Alta | 1 |
| RF-LP-02 | Exibir seção de destaque com categorias principais de produtos. | Média | 1 |
| RF-LP-03 | Exibir informações de contato (WhatsApp, endereço, redes sociais). | Alta | 1 |
| RF-LP-04 | Ser responsiva para mobile, tablet e desktop. | Alta | 1 |
| RF-LP-05 | Exibir botão fixo de WhatsApp para contato direto. | Alta | 1 |
| RF-LP-06 | Permitir SEO básico (title, description, og:tags por página). | Baixa | 1 |

## Módulo: Catálogo

| ID | Descrição | Prioridade | Fase |
|---|---|---|---|
| RF-CAT-01 | Listar produtos ativos em grade, com imagem, nome, categoria e preço. | Alta | 1 |
| RF-CAT-02 | Permitir filtrar produtos por categoria. | Alta | 1 |
| RF-CAT-03 | Permitir buscar produtos por nome/palavra-chave. | Média | 1 |
| RF-CAT-04 | Exibir página de detalhe do produto (descrição, imagens, variações, preço). | Alta | 1 |
| RF-CAT-05 | Exibir o preço correspondente ao tipo de cliente logado; exibir Preço C (padrão) para visitante anônimo. | Alta | 1 |
| RF-CAT-06 | Permitir adicionar produto ao carrinho de orçamento a partir da listagem e do detalhe. | Alta | 1 |
| RF-CAT-07 | Paginar ou usar scroll infinito na listagem de produtos. | Baixa | 1 |

## Módulo: Orçamento via WhatsApp

| ID | Descrição | Prioridade | Fase |
|---|---|---|---|
| RF-ORC-01 | Permitir montar um carrinho de orçamento com múltiplos produtos e quantidades. | Alta | 1 |
| RF-ORC-02 | Permitir editar quantidade e remover itens do carrinho antes de enviar. | Alta | 1 |
| RF-ORC-03 | Persistir o carrinho no navegador (localStorage) entre sessões até o envio. | Média | 1 |
| RF-ORC-04 | Ao finalizar, gerar mensagem formatada com lista de produtos, quantidades e preços, e abrir o WhatsApp Web/App com a mensagem pré-preenchida. | Alta | 1 |
| RF-ORC-05 | Capturar nome do cliente antes de gerar o orçamento, para registrar a origem do contato. | Média | 1 |
| RF-ORC-06 | Limpar o carrinho após o envio do orçamento ser confirmado pelo usuário. | Baixa | 1 |

## Módulo: Painel Admin

| ID | Descrição | Prioridade | Fase |
|---|---|---|---|
| RF-ADM-01 | Tela de login com autenticação JWT. | Alta | 2 |
| RF-ADM-02 | Dashboard inicial com indicadores resumidos (pedidos do mês, clientes novos, produtos mais vendidos). | Média | 2 |
| RF-ADM-03 | Controle de acesso por role: ADMIN (acesso total) e VENDEDOR (acesso restrito, sem configurações sensíveis). | Alta | 2 |
| RF-ADM-04 | Tela de gestão de usuários internos (criar, editar, inativar). | Média | 2 |
| RF-ADM-05 | Logout e expiração automática de sessão pelo token JWT. | Alta | 2 |

## Módulo: Clientes

| ID | Descrição | Prioridade | Fase |
|---|---|---|---|
| RF-CLI-01 | Cadastrar cliente com nome, documento, telefone, e-mail, endereço, tipo de cliente (A/B/C) e origem. | Alta | 2 |
| RF-CLI-02 | Listar clientes com filtro por status (Prospect, Ativo, Inativo) e origem. | Alta | 2 |
| RF-CLI-03 | Editar dados do cliente. | Alta | 2 |
| RF-CLI-04 | Alterar status do cliente manualmente (Prospect → Ativo → Inativo). | Média | 2 |
| RF-CLI-05 | Exibir histórico de pedidos do cliente na tela de detalhe. | Média | 2 |
| RF-CLI-06 | Impedir duplicidade de cliente por documento (CPF/CNPJ). | Alta | 2 |

## Módulo: Pedidos

| ID | Descrição | Prioridade | Fase |
|---|---|---|---|
| RF-PED-01 | Criar pedido manualmente vinculado a um cliente, com itens, quantidades e preços. | Alta | 2 |
| RF-PED-02 | Listar pedidos com filtro por status, cliente e período. | Alta | 2 |
| RF-PED-03 | Alterar status do pedido (Orçamento, Confirmado, Em preparação, Concluído, Cancelado). | Alta | 2 |
| RF-PED-04 | Calcular automaticamente o total do pedido a partir dos itens. | Alta | 2 |
| RF-PED-05 | Registrar a origem do pedido (mesmo enum de origem do cliente). | Média | 2 |
| RF-PED-06 | Gerar movimentação de produto (saída) ao confirmar um pedido. | Média | 2 |

## Módulo: Produtos

| ID | Descrição | Prioridade | Fase |
|---|---|---|---|
| RF-PRO-01 | Cadastrar produto com nome, descrição, categoria, fornecedor, imagens, Preço A/B/C e status (ativo/inativo). | Alta | 2 |
| RF-PRO-02 | Editar e inativar produto (soft delete via status, nunca exclusão física). | Alta | 2 |
| RF-PRO-03 | Cadastrar e gerenciar categorias de produto. | Alta | 2 |
| RF-PRO-04 | Cadastrar e gerenciar fornecedores. | Média | 2 |
| RF-PRO-05 | Vincular produto a um fornecedor principal. | Média | 2 |
| RF-PRO-06 | Registrar movimentações de produto (entrada/saída) mesmo sem controle de estoque físico, como log de rastreabilidade. | Baixa | 2 |

## Módulo: Financeiro

| ID | Descrição | Prioridade | Fase |
|---|---|---|---|
| RF-FIN-01 | Registrar lançamentos financeiros simples (entrada/saída) vinculados ou não a um pedido. | Alta | 3 |
| RF-FIN-02 | Exibir saldo e fluxo de caixa simplificado por período. | Alta | 3 |
| RF-FIN-03 | Gerar relatório de vendas por período, produto e canal de origem. | Média | 3 |
| RF-FIN-04 | Gerar relatório de clientes por status e origem. | Baixa | 3 |
| RF-FIN-05 | Exportar relatórios em CSV. | Baixa | 3 |
