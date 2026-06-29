# Prompts Prontos — Tarefas Comuns

Cada prompt já inclui o contexto necessário para a IA executar sem precisar perguntar. Adapte apenas os detalhes específicos (nome do campo, da entidade, etc.) quando aplicável.

---

## Implementar endpoint de criação de produto

> Implemente o endpoint `POST /api/products` no backend do MaxHub, conforme especificado em `docs/05-API_REST.md` (seção `/products`) e `docs/04-MODELO_DE_DADOS.md` (tabela `products`). Crie a entidade `Product` (se ainda não existir), o DTO `ProductRequest` com validação Bean Validation (nome obrigatório, categoria obrigatória, `priceA`/`priceB`/`priceC` obrigatórios e maiores que zero), o `ProductMapper` (MapStruct) e o `ProductService.create()`. O endpoint deve exigir autenticação com role `ADMIN` ou `VENDEDOR` (ver `docs/07-BACKEND.md`, seção de permissões). Siga a estrutura de pacotes descrita em `docs/07-BACKEND.md`. Não exponha a entidade diretamente — retorne `ProductResponse`. Se a categoria informada não existir, lance `ResourceNotFoundException`.

## Criar o componente de card de produto

> Crie o componente `ProductCard` em `frontend/src/components/catalog/ProductCard.tsx`, usado na grade do catálogo (`docs/06-FRONTEND.md`). Deve receber um produto (`id`, `name`, `mainImageUrl`, `categoryName`, `displayPrice`) via props e exibir imagem, nome, categoria e preço formatado em Real (usar `utils/formatCurrency.ts`). Deve ter um botão "Adicionar ao orçamento" que chama `useCart().addItem(product, 1)`. Use os tokens de cor e tipografia definidos em `docs/08-DESIGN_SYSTEM.md` (variante `interactive` do Card). Componente deve ser responsivo conforme breakpoints descritos em `docs/06-FRONTEND.md`.

## Adicionar validação no formulário de cliente

> No formulário de cliente (`CustomerFormPage`, usado em `/admin/clientes/novo` e `/admin/clientes/:id/editar`), adicione validação via React Hook Form para os campos conforme `docs/03-REGRAS_DE_NEGOCIO.md` (seção "Validações esperadas por entidade — Cliente"): nome obrigatório (mín. 3 caracteres), documento obrigatório (CPF 11 dígitos ou CNPJ 14 dígitos, usar `utils/formatDocument.ts` para máscara), telefone obrigatório, e-mail opcional mas com formato válido se preenchido, tipo de cliente e origem obrigatórios. O campo de origem deve ser desabilitado (somente leitura) quando o formulário estiver em modo de edição (cliente já existente). As mensagens de erro devem aparecer abaixo de cada campo, no padrão do componente `Input` (variante `error`) descrito em `docs/08-DESIGN_SYSTEM.md`.

## Implementar a geração de orçamento via WhatsApp

> Implemente a função `buildWhatsAppMessage` em `frontend/src/utils/buildWhatsAppMessage.ts`, que recebe os itens do carrinho (`useCart()`) e o nome do cliente, e retorna a URL `https://wa.me/<numero>?text=<mensagem_codificada>` conforme o formato de mensagem especificado em `docs/03-REGRAS_DE_NEGOCIO.md` (seção "Fluxo de orçamento via WhatsApp"). O número de telefone da empresa deve vir de uma variável de ambiente (`VITE_WHATSAPP_NUMBER`), nunca hardcoded. Use essa função na `CartPage` no botão "Enviar orçamento via WhatsApp": ao clicar, abrir a URL em nova aba (`window.open`) e, após confirmação do usuário (modal simples perguntando "Você enviou a mensagem?"), chamar `useCart().clearCart()`.

## Criar endpoint de listagem de pedidos com filtro

> Implemente o endpoint `GET /api/orders` no backend, conforme `docs/05-API_REST.md` (seção `/orders`). Deve aceitar query params `status`, `customerId`, `from`, `to`, `page`, `size`, retornando uma resposta paginada (`PageResponse<OrderSummaryResponse>`) com `id`, `customerName`, `status`, `origin`, `total`, `createdAt`. Exige autenticação (`ADMIN` ou `VENDEDOR`). Use Spring Data JPA Specifications ou query derivada no `OrderRepository` para compor os filtros dinamicamente — não monte SQL manual concatenando strings.

## Implementar transição de status de pedido com movimentação de estoque

> Implemente o endpoint `PATCH /api/orders/{id}/status` conforme `docs/05-API_REST.md`. No `OrderService`, ao transicionar o status para `CONFIRMADO`, gere automaticamente um registro em `stock_movements` (tipo `SAIDA`) para cada item do pedido, vinculando `order_id` e `product_id`, conforme regra descrita em `docs/03-REGRAS_DE_NEGOCIO.md` (seção "Movimentações de produto sem estoque físico"). Essa geração deve ocorrer na mesma transação (`@Transactional`) da atualização do status — se falhar, o status não deve ser alterado.

---

Ao usar qualquer um destes prompts (ou criar um novo no mesmo estilo), sempre referencie o documento de `docs/` correspondente em vez de redigitar a regra — isso evita divergência entre código e documentação.
