# 08 — Design System

Identidade visual profissional, sóbria, adequada a um negócio B2B/B2C de embalagens. Prioriza legibilidade e confiança.

## Paleta de cores

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#1E3A5F` | Azul-marinho profundo — header, botões primários, links principais. |
| `primary-light` | `#3D6491` | Hover/estados ativos do primary. |
| `secondary` | `#F2A93B` | Âmbar/laranja — CTAs de destaque (ex.: "Pedir orçamento"), badges de atenção. |
| `success` | `#2E9E5B` | Confirmações, status "Concluído"/"Ativo". |
| `danger` | `#D64545` | Erros, exclusões, status "Cancelado"/"Inativo". |
| `warning` | `#E8B339` | Avisos, status "Em preparação". |
| `neutral-900` | `#1A1D23` | Texto principal. |
| `neutral-600` | `#5B6472` | Texto secundário. |
| `neutral-300` | `#D7DBE0` | Bordas, divisores. |
| `neutral-100` | `#F4F5F7` | Fundo de seções alternadas, cards. |
| `white` | `#FFFFFF` | Fundo base. |

## Tipografia

- **Fonte principal:** `Inter` (sans-serif, boa legibilidade em UI e leitura de tabelas). Fallback: `system-ui, sans-serif`.
- **Escala de tamanhos:**

| Token | Tamanho | Uso |
|---|---|---|
| `text-xs` | 12px | Labels auxiliares, badges. |
| `text-sm` | 14px | Texto de tabela, inputs. |
| `text-base` | 16px | Corpo de texto padrão. |
| `text-lg` | 18px | Subtítulos de card/seção. |
| `text-xl` | 22px | Títulos de página (admin). |
| `text-2xl` | 28px | Títulos de seção na Landing Page. |
| `text-3xl` | 36px | Título principal (hero) da Landing Page. |

Pesos: `400` (regular, corpo), `500` (medium, labels/botões), `700` (bold, títulos).

## Espaçamentos padrão

Escala baseada em múltiplos de 4px (padrão Tailwind, sem customização de `spacing`):

| Token | Valor | Uso típico |
|---|---|---|
| `space-1` | 4px | Espaço entre ícone e texto. |
| `space-2` | 8px | Padding interno de badges. |
| `space-3` | 12px | Padding interno de inputs/botões pequenos. |
| `space-4` | 16px | Padding padrão de cards, gap entre itens de formulário. |
| `space-6` | 24px | Espaço entre seções de um formulário. |
| `space-8` | 32px | Espaço entre blocos de conteúdo. |
| `space-12` | 48px | Espaço entre seções da Landing Page. |
| `space-16` | 64px | Margem vertical de seções hero. |

## Componentes base

### Button
Variantes: `primary` (fundo `primary`, texto branco), `secondary` (fundo `secondary`, texto `neutral-900`), `outline` (borda `primary`, fundo transparente), `danger` (fundo `danger`, texto branco), `ghost` (sem fundo, texto `primary`, usado em ações secundárias de tabela).
Tamanhos: `sm`, `md` (padrão), `lg`. Estados: `default`, `hover`, `disabled` (opacidade 50%, cursor not-allowed), `loading` (spinner inline, texto mantido).

### Input
Variantes: `default`, `error` (borda `danger` + mensagem de erro abaixo), `disabled`.
Sempre com `label` acima e, quando aplicável, texto de ajuda (`helper text`) abaixo em `text-xs`/`neutral-600`.

### Card
Variantes: `default` (borda `neutral-300`, fundo branco, sombra leve), `flat` (sem sombra, usado dentro de outros containers), `interactive` (hover com leve elevação, usado em `ProductCard`).

### Badge
Variantes mapeadas a status do domínio:
- `success` → Ativo / Concluído.
- `warning` → Prospect / Em preparação.
- `danger` → Inativo / Cancelado.
- `neutral` → Orçamento (estado inicial neutro).
- `info` (azul `primary-light`) → Confirmado.

### Modal
Variantes: `default` (confirmação/formulário, largura média), `fullscreen-mobile` (ocupa tela cheia em mobile, centralizado em desktop — usado no `CartDrawer` em telas pequenas).
Sempre com overlay escuro (`rgba(0,0,0,0.4)`), fechável por `Esc` e clique fora, exceto modais de confirmação destrutiva (exige clique explícito em ação ou cancelar).

### Table
Variantes: `default` (linhas zebradas em `neutral-100`/branco), `compact` (padding reduzido, usado em listagens densas como `OrdersPage`).
Sempre com estado vazio (`empty state`) ilustrado com texto explicativo e ação sugerida (ex.: "Nenhum produto cadastrado — Adicionar produto").

### Toast
Variantes: `success`, `error`, `info`, `warning` — mesma paleta de cores dos badges. Posição padrão: canto superior direito. Duração padrão: 4s, com opção de fechar manualmente.

## Design tokens (Tailwind config)

```ts
// tailwind.config.ts (extract)
export default {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1E3A5F', light: '#3D6491' },
        secondary: { DEFAULT: '#F2A93B' },
        success: '#2E9E5B',
        danger: '#D64545',
        warning: '#E8B339',
        neutral: {
          100: '#F4F5F7',
          300: '#D7DBE0',
          600: '#5B6472',
          900: '#1A1D23',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '22px',
        '2xl': '28px',
        '3xl': '36px',
      },
    },
  },
};
```

Variáveis CSS equivalentes (para uso fora do Tailwind, se necessário):

```css
:root {
  --color-primary: #1E3A5F;
  --color-primary-light: #3D6491;
  --color-secondary: #F2A93B;
  --color-success: #2E9E5B;
  --color-danger: #D64545;
  --color-warning: #E8B339;
  --color-neutral-100: #F4F5F7;
  --color-neutral-300: #D7DBE0;
  --color-neutral-600: #5B6472;
  --color-neutral-900: #1A1D23;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```
