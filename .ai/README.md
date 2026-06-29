# .ai/ — Guia para Desenvolvimento Assistido por IA

Esta pasta existe para que qualquer IA (ou desenvolvedor humano) consiga começar a trabalhar no MaxHub sem precisar perguntar contexto básico ou repetir decisões já tomadas.

## Conteúdo

- **CONTEXT.md** — resumo direto do projeto: o que é, stack, fases, estado atual.
- **RULES.md** — regras obrigatórias de código e arquitetura. Não opcionais.
- **PROMPTS.md** — prompts prontos para tarefas comuns, já com o contexto necessário embutido.
- **WORKFLOW.md** — passo a passo de como desenvolver uma feature do início ao fim.

## Como uma IA deve usar esta pasta antes de qualquer tarefa

1. Ler **CONTEXT.md** primeiro, para saber em que fase o projeto está e o que já existe.
2. Ler **RULES.md** antes de escrever qualquer código — essas regras não devem ser violadas nem reinterpretadas.
3. Consultar os documentos detalhados em [`../docs/`](../docs/) para a área específica da tarefa (regras de negócio, modelo de dados, API, frontend, backend, design system).
4. Se a tarefa for uma das listadas em **PROMPTS.md**, usar aquele prompt como base, completando apenas os detalhes específicos da tarefa atual.
5. Seguir o processo descrito em **WORKFLOW.md** para planejar, implementar e revisar a mudança.

Se houver qualquer contradição entre esta pasta e `docs/`, **`docs/` é a fonte de verdade** — esta pasta apenas resume e operacionaliza o que está documentado em `docs/`.
