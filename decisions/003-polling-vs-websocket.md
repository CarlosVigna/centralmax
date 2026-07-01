# ADR 003 — Polling vs WebSocket para notificações em tempo real

## Contexto

O Bloco 5 introduz notificações de pedidos (sino no header) e auto-refresh no board de expedição. Surgiram duas abordagens:

1. **WebSocket / SSE**: conexão persistente, atualizações instantâneas ao acontecer o evento.
2. **Polling via React Query `refetchInterval`**: requisição HTTP repetida a cada N segundos.

## Decisão

Usaremos **polling via React Query** (`refetchInterval: 60_000`) para o board de expedição e para o sino de notificações.

## Justificativa

- **Volume de eventos é baixo**: o MaxHub processa pedidos manualmente — mudanças de status ocorrem em escala de minutos, não segundos.
- **Infraestrutura já disponível**: o backend expõe REST; adicionar WebSocket exigiria configurar Spring WebSocket + STOMP, aumentando o escopo e a complexidade operacional sem benefício real.
- **Deploy em Railway/Render**: conexões WebSocket persistentes consomem mais recursos em planos gratuitos/básicos; polling tem custo previsível.
- **React Query já presente na stack**: `refetchInterval` é idiomático, sem dependências novas. O cache compartilhado deduplica requisições quando múltiplos componentes usam a mesma query key.
- **Latência aceitável**: atraso de até 60 s entre evento e exibição é adequado para o fluxo de expedição atual.

## Consequências

- Latência de ~60 s na atualização das notificações e do board (aceitável para o negócio).
- Cada usuário logado gera 1 req/min para `/api/notifications/summary` e 1 req/min para `/api/orders/board` (quando na página de expedição). Volume irrisório para o porte atual.
- Se o volume de pedidos crescer e a latência de 60 s se tornar um problema, migrar para SSE (Server-Sent Events) é o passo natural: mantém HTTP simples, não exige STOMP/broker, e os componentes frontend mudam apenas a fonte de dados.
