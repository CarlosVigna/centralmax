# Regras Obrigatórias de Desenvolvimento

Estas regras não são sugestões — qualquer código gerado para o MaxHub deve segui-las. Quando uma regra entrar em conflito com uma instrução pontual de tarefa, a regra prevalece, salvo decisão explícita do arquiteto do projeto registrada em `decisions/`.

## Backend

1. **Nunca exponha entidades JPA diretamente na API.** Toda entrada e saída de Controller usa DTOs (`*Request`/`*Response`). Conversão Entity ↔ DTO sempre via MapStruct (`*Mapper`).
2. **Sempre valide no backend**, mesmo que o frontend já valide o mesmo campo. Validação de frontend é UX; validação de backend é a garantia real. Use Bean Validation (`@NotBlank`, `@Positive`, etc.) nos DTOs de request.
3. **Siga a separação de camadas:** Controller não contém lógica de negócio; Service não acessa `HttpServletRequest`/detalhes HTTP; Repository não contém lógica, só queries declarativas. Ver [`../docs/07-BACKEND.md`](../docs/07-BACKEND.md).
4. **Exclusão é sempre lógica** (`status`/`active`), nunca `DELETE` físico em entidades de negócio (produtos, categorias, fornecedores, clientes). Exceção: `stock_movements` é log puro, não tem exclusão.
5. **Toda regra de negócio documentada em [`../docs/03-REGRAS_DE_NEGOCIO.md`](../docs/03-REGRAS_DE_NEGOCIO.md) deve ser implementada exatamente como descrita** — preços por tipo de cliente, status de cliente, origem imutável, etc. Não simplifique nem invente variações.
6. **Migrations Flyway são imutáveis após aplicadas.** Nunca edite uma migration já existente; crie uma nova (`V{n+1}__descricao.sql`) para qualquer alteração de schema.
7. **Toda mudança de schema deve refletir o modelo descrito em [`../docs/04-MODELO_DE_DADOS.md`](../docs/04-MODELO_DE_DADOS.md).** Se a tarefa exigir um campo ou tabela não documentada, atualize o documento como parte da tarefa, não apenas o código.
8. **Endpoints novos devem seguir o padrão de [`../docs/05-API_REST.md`](../docs/05-API_REST.md):** formato de erro padronizado, paginação padronizada, códigos de status consistentes.
9. **Erros de negócio lançam exceções customizadas** (`BusinessException`, `ResourceNotFoundException`, `DuplicateResourceException`), nunca `RuntimeException` genérica — o `GlobalExceptionHandler` depende do tipo para formatar a resposta.

## Frontend

10. **Toda chamada à API passa por um `*Service.ts` em `services/`**, nunca chame `axios`/`fetch` diretamente de um componente ou hook.
11. **Dados remotos sempre via React Query** (`useQuery`/`useMutation`), nunca `useEffect` + `useState` manual para buscar dados da API.
12. **Formulários sempre via React Hook Form**, com validação alinhada à validação do backend (mesmas regras, mesmas mensagens quando possível).
13. **Não duplique estado que já existe no `AuthContext` ou `CartContext`** — use os hooks `useAuth()`/`useCart()` correspondentes.
14. **Componentes de UI genéricos (`components/ui/`) não conhecem regras de negócio** — recebem props e emitem eventos; lógica de domínio fica em `pages/` ou `hooks/`.
15. **Toda página nova deve ser registrada nas rotas** (`routes/AppRoutes.tsx`) com o guard correto (`PublicRoute` ou `PrivateRoute`), conforme [`../docs/06-FRONTEND.md`](../docs/06-FRONTEND.md).

## Geral

16. **Nomenclatura em inglês no código** (classes, variáveis, funções, rotas de API, nomes de tabela/coluna); **comentários e textos de UI em português** (é o idioma dos usuários finais do MaxHub).
17. **Siga Clean Architecture e SOLID**: dependências apontam para dentro (camadas externas dependem de internas, nunca o contrário); uma classe, uma responsabilidade.
18. **Não adicione funcionalidade além do que foi pedido.** Se notar uma lacuna na documentação durante a implementação, sinalize e pergunte — não decida sozinho uma regra de negócio não documentada.
19. **Não escreva código para fases futuras "por antecipação"** (ex.: não implemente pagamento online ou estoque físico só porque "vai ser útil depois"). Implemente exatamente o que a fase atual exige.
20. **Sempre que uma decisão arquitetural relevante for tomada durante o desenvolvimento** (ex.: escolha de biblioteca não listada na stack, mudança de padrão), registre em `decisions/` como um ADR simples (contexto, decisão, consequências).
