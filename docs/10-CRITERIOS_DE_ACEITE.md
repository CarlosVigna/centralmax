# 10 — Critérios de Aceite

Formato: **Funcionalidade → Cenário → Critério de aceite.**

## Login (Painel Admin — Fase 2)

**Cenário: login com credenciais válidas**
- Critério: ao informar e-mail e senha corretos, o usuário é autenticado, recebe um token JWT válido e é redirecionado para o Dashboard (`/admin`).

**Cenário: login com credenciais inválidas**
- Critério: o sistema exibe mensagem de erro clara ("E-mail ou senha inválidos") sem indicar qual dos dois campos está incorreto, e não autentica o usuário.

**Cenário: acesso a rota protegida sem sessão ativa**
- Critério: ao acessar qualquer rota `/admin/*` sem token válido, o usuário é redirecionado automaticamente para `/admin/login`.

**Cenário: token expirado durante uso**
- Critério: ao receber `401` de qualquer chamada à API, a sessão é limpa e o usuário é redirecionado para `/admin/login`.

## Catálogo

**Cenário: listagem de produtos**
- Critério: a página de catálogo exibe todos os produtos com `status = ATIVO`, com imagem, nome e preço (Preço C para visitante não autenticado).

**Cenário: filtro por categoria**
- Critério: ao selecionar uma categoria, a listagem exibe apenas produtos vinculados a ela, sem recarregar a página inteira.

**Cenário: busca por nome**
- Critério: ao digitar um termo de busca, a listagem é atualizada para exibir apenas produtos cujo nome contenha o termo (case-insensitive).

**Cenário: produto inativo**
- Critério: produtos com `status = INATIVO` nunca aparecem no catálogo público, em nenhuma listagem ou busca.

## Carrinho de orçamento

**Cenário: adicionar produto ao carrinho**
- Critério: ao clicar em "adicionar ao orçamento" em um produto, o item aparece no carrinho com quantidade 1; se o produto já estiver no carrinho, a quantidade é incrementada em vez de duplicar a linha.

**Cenário: editar quantidade**
- Critério: o usuário consegue aumentar/diminuir a quantidade de um item diretamente no carrinho, com o total recalculado automaticamente.

**Cenário: remover item**
- Critério: ao remover um item, ele desaparece do carrinho e o total é recalculado; se for o último item, o carrinho exibe estado vazio.

**Cenário: persistência do carrinho**
- Critério: ao recarregar a página ou fechar e reabrir o navegador (sem limpar dados), os itens do carrinho permanecem, lidos do localStorage.

## Geração de orçamento via WhatsApp

**Cenário: finalizar orçamento com carrinho válido**
- Critério: ao clicar em "Enviar orçamento via WhatsApp" com ao menos 1 item no carrinho e nome informado, o sistema gera uma mensagem formatada (lista de produtos, quantidades, preços e total) e abre o WhatsApp (Web ou App) com a mensagem pré-preenchida, direcionada ao número oficial da empresa.

**Cenário: tentar finalizar carrinho vazio**
- Critério: o botão de finalizar orçamento fica desabilitado (ou exibe aviso) quando o carrinho está vazio, impedindo o envio.

**Cenário: nome não informado**
- Critério: o sistema exige o nome do cliente antes de habilitar o envio do orçamento, exibindo validação no campo se vazio.

**Cenário: confirmação de envio**
- Critério: após o usuário confirmar que enviou a mensagem pelo WhatsApp, o carrinho é limpo automaticamente.

## Cadastro de produto (Painel Admin — Fase 2)

**Cenário: cadastro com dados válidos**
- Critério: ao preencher nome, categoria, Preço A/B/C válidos (> 0) e salvar, o produto é criado com `status = ATIVO` e passa a aparecer no catálogo público.

**Cenário: preços inválidos**
- Critério: ao tentar salvar com algum dos preços igual a zero, negativo ou vazio, o sistema bloqueia o salvamento e exibe erro de validação no campo correspondente.

**Cenário: inativação de produto**
- Critério: ao inativar um produto, ele some imediatamente do catálogo público, mas continua acessível no Painel Admin e em pedidos antigos que o referenciam.

**Cenário: edição de produto**
- Critério: ao editar nome, descrição, preços ou categoria de um produto existente, as mudanças refletem no catálogo público imediatamente após salvar.

## Cadastro de cliente (Painel Admin — Fase 2)

**Cenário: cadastro com dados válidos**
- Critério: ao preencher nome, documento, telefone e origem, o cliente é criado com `status = PROSPECT`.

**Cenário: documento duplicado**
- Critério: ao tentar cadastrar um cliente com documento (CPF/CNPJ) já existente no sistema, o sistema bloqueia o cadastro e exibe mensagem informando a duplicidade.

**Cenário: origem obrigatória**
- Critério: o sistema não permite salvar um cliente sem origem selecionada.

**Cenário: edição de cliente**
- Critério: o usuário consegue editar nome, telefone, e-mail, endereço, tipo de cliente e status; o campo de origem é somente leitura na edição (não pode ser alterado após a criação).
