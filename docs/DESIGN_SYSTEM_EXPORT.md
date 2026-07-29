# MaxHub — Design System Export

> Extração completa do design system do frontend MaxHub (CentralMax Embalagens).
> Gerado automaticamente a partir do código-fonte em `frontend/`.

---

## 1. TAILWIND CONFIG

Arquivo: `frontend/tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0f1f3d', light: '#1e3a6e' },
        secondary: { DEFAULT: '#f97316' },
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
  plugins: [],
} satisfies Config;
```

---

## 2. CSS GLOBAL

Arquivo: `frontend/src/styles/globals.css`

> Nota: não existe `frontend/src/index.css` no projeto — o CSS global fica em `src/styles/globals.css`.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
}
```

---

## 3. CORES E TOKENS

### Paleta principal (definida no `tailwind.config.ts`)

| Token | Valor | Uso típico |
|---|---|---|
| `primary` (DEFAULT) | `#0f1f3d` | Azul-marinho institucional — header, sidebar ativa, textos de destaque, splash screen |
| `primary-light` | `#1e3a6e` | Hover de botões primary, links, badge "info" |
| `secondary` (DEFAULT) | `#f97316` | Laranja — CTA, botões secundários, badges de contagem, theme-color do PWA |
| `success` | `#2E9E5B` | Verde — estados de sucesso, toast, badges |
| `danger` | `#D64545` | Vermelho — erros, exclusão, badges de atraso |
| `warning` | `#E8B339` | Amarelo/ocre — alertas, badges de atenção |
| `neutral-100` | `#F4F5F7` | Fundo de página/app (bg-neutral-100) |
| `neutral-300` | `#D7DBE0` | Bordas (border-neutral-300) |
| `neutral-600` | `#5B6472` | Texto secundário |
| `neutral-900` | `#1A1D23` | Texto principal |

### Cores adicionais usadas via classes utilitárias padrão do Tailwind (não customizadas no config)
Encontradas no uso dos componentes, mas fora da paleta customizada acima — vêm da paleta default do Tailwind:
- `purple-100` / `purple-700` (Badge variant "purple")
- `green-600` (link do WhatsApp no AdminLayout)
- `red-500` (validação do WhatsAppNameModal)
- `black/40`, `black/50` (overlays de modal/drawer)
- `white`, `white/90` (Header público)

### Tipografia

- **Font family:** `Inter` (com fallback `system-ui, sans-serif`) — aplicada tanto no Tailwind (`fontFamily.sans`) quanto direto no `body` do CSS global.
- **Escala de tamanhos customizada:**

| Token | Valor |
|---|---|
| `text-xs` | 12px |
| `text-sm` | 14px |
| `text-base` | 16px |
| `text-lg` | 18px |
| `text-xl` | 22px |
| `text-2xl` | 28px |
| `text-3xl` | 36px |

### Border radius / sombras (padrões do Tailwind, sem customização)
- `rounded-md`, `rounded-lg`, `rounded-full`, `rounded-xl` — usados conforme componente (botões `rounded-md`, cards `rounded-lg`, badges/avatares `rounded-full`, modais/dropdowns `rounded-xl`)
- `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl` — hierarquia de elevação (Card default = `shadow-sm`, hover = `shadow-md`; modais = `shadow-lg`/`shadow-2xl`)

### Ícones
- Não há biblioteca de ícones (`lucide-react` etc.) instalada — todos os ícones são **SVGs inline customizados** (viewBox 24x24, `stroke="currentColor"`, `strokeWidth={2}`), definidos como pequenos componentes React dentro de `AdminSidebar.tsx` e `AdminLayout.tsx`.

---

## 4. COMPONENTES UI

Diretório: `frontend/src/components/ui/`

### 4.1 Badge.tsx

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'purple';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-neutral-300/50 text-neutral-900',
  info: 'bg-primary-light/10 text-primary-light',
  purple: 'bg-purple-100 text-purple-700',
};

export function Badge({ variant = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
```

### 4.2 Button.tsx

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-light',
  secondary: 'bg-secondary text-neutral-900 hover:opacity-90',
  outline: 'border border-primary text-primary bg-transparent hover:bg-neutral-100',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'bg-transparent text-primary hover:bg-neutral-100',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### 4.3 Card.tsx

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'flat' | 'interactive';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'bg-white border border-neutral-300 shadow-sm',
  flat: 'bg-white',
  interactive: 'bg-white border border-neutral-300 shadow-sm hover:shadow-md transition cursor-pointer',
};

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  return (
    <div className={`rounded-lg p-4 ${VARIANT_CLASSES[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
```

### 4.4 GlobalSearch.tsx

```tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listCustomers } from '../../services/customerService';
import { listOrders } from '../../services/orderService';
import { listAdminProducts } from '../../services/productService';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    function onOpenEvent() { setOpen(true); }
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('globalSearch:open', onOpenEvent);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      window.removeEventListener('globalSearch:open', onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const enabled = debouncedQuery.length >= 2;

  const { data: customersPage } = useQuery({
    queryKey: ['gsearch-customers', debouncedQuery],
    queryFn: () => listCustomers({ search: debouncedQuery, size: 5 }),
    enabled,
  });

  const { data: ordersPage } = useQuery({
    queryKey: ['gsearch-orders', debouncedQuery],
    queryFn: () => listOrders({ search: debouncedQuery, size: 5 }),
    enabled,
  });

  const { data: productsPage } = useQuery({
    queryKey: ['gsearch-products', debouncedQuery],
    queryFn: () => listAdminProducts({ search: debouncedQuery, size: 5 }),
    enabled,
  });

  function go(path: string) {
    setOpen(false);
    navigate(path);
  }

  if (!open) return null;

  const customers = customersPage?.content ?? [];
  const orders = ordersPage?.content ?? [];
  const products = productsPage?.content ?? [];
  const hasResults = customers.length > 0 || orders.length > 0 || products.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh]"
      onMouseDown={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-neutral-200 px-4">
          <span className="mr-3 text-neutral-400">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clientes, pedidos, produtos..."
            className="flex-1 py-4 text-sm outline-none placeholder:text-neutral-400"
          />
          <kbd className="ml-2 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[11px] font-medium text-neutral-400">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {debouncedQuery.length < 2 ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-400">
              {query.length === 0 ? 'Digite para buscar...' : 'Continue digitando...'}
            </p>
          ) : !hasResults ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-400">
              Nenhum resultado para &ldquo;{debouncedQuery}&rdquo;
            </p>
          ) : (
            <>
              {customers.length > 0 && (
                <section>
                  <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    Clientes
                  </p>
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => go(`/admin/clientes/${c.id}`)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50"
                    >
                      <span className="text-sm font-medium text-neutral-900">{c.name}</span>
                      {c.phone && (
                        <span className="ml-auto text-xs text-neutral-400">{c.phone}</span>
                      )}
                    </button>
                  ))}
                </section>
              )}

              {orders.length > 0 && (
                <section>
                  <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    Pedidos
                  </p>
                  {orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => go(`/admin/pedidos/${o.id}`)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50"
                    >
                      <span className="font-mono text-sm font-semibold text-primary">
                        {o.orderNumber}
                      </span>
                      <span className="text-sm text-neutral-700">{o.customerDisplayName}</span>
                      <span className="ml-auto text-xs text-neutral-400">{o.statusLabel}</span>
                    </button>
                  ))}
                </section>
              )}

              {products.length > 0 && (
                <section>
                  <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    Produtos
                  </p>
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => go(`/admin/produtos/${p.id}/editar`)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50"
                    >
                      <span className="text-sm font-medium text-neutral-900">{p.name}</span>
                      <span className="ml-auto text-xs text-neutral-400">{p.categoryName}</span>
                    </button>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 4.5 Input.tsx

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-neutral-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            error ? 'border-danger focus:ring-danger' : 'border-neutral-300 focus:ring-primary-light'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
        {!error && helperText && <span className="text-xs text-neutral-600">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### 4.6 Modal.tsx

```tsx
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg" onClick={(event) => event.stopPropagation()}>
        {title && <h2 className="mb-4 text-lg font-semibold text-neutral-900">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
```

### 4.7 Pagination.tsx

```tsx
interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
}

const SIZE_OPTIONS = [10, 20, 50];

function pageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | '...')[] = [];
  if (current <= 3) {
    pages.push(0, 1, 2, 3, 4, '...', total - 1);
  } else if (current >= total - 4) {
    pages.push(0, '...', total - 5, total - 4, total - 3, total - 2, total - 1);
  } else {
    pages.push(0, '...', current - 1, current, current + 1, '...', total - 1);
  }
  return pages;
}

export function Pagination({ page, totalPages, totalElements, size, onPageChange, onSizeChange }: PaginationProps) {
  if (totalPages <= 1 && totalElements <= (SIZE_OPTIONS[0] ?? 10)) return null;

  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm">
      <p className="text-xs text-neutral-500">
        Exibindo <span className="font-medium">{from}–{to}</span> de{' '}
        <span className="font-medium">{totalElements}</span> resultado(s)
      </p>

      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="rounded border border-neutral-300 px-2.5 py-1 text-xs disabled:opacity-40 hover:bg-neutral-50 transition"
        >
          ← Anterior
        </button>

        {totalPages > 1 && pageRange(page, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-1 text-xs text-neutral-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-[2rem] rounded border px-2 py-1 text-xs transition
                ${p === page
                  ? 'border-primary bg-primary font-medium text-white'
                  : 'border-neutral-300 hover:bg-neutral-50'}`}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded border border-neutral-300 px-2.5 py-1 text-xs disabled:opacity-40 hover:bg-neutral-50 transition"
        >
          Próxima →
        </button>
      </div>

      {onSizeChange && (
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <span>Itens:</span>
          <select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="rounded border border-neutral-300 px-1.5 py-1 text-xs focus:outline-none"
          >
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
```

### 4.8 Select.tsx

```tsx
import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-neutral-900">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            error ? 'border-danger focus:ring-danger' : 'border-neutral-300 focus:ring-primary-light'
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
```

### 4.9 Table.tsx

```tsx
import type { ReactNode } from 'react';

export interface TableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  variant?: 'default' | 'compact';
}

export function Table<T extends { id: string }>({
  columns,
  data,
  emptyMessage = 'Nenhum registro encontrado.',
  variant = 'default',
}: TableProps<T>) {
  const cellPadding = variant === 'compact' ? 'px-3 py-1.5' : 'px-4 py-2';

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-neutral-600">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-300">
            {columns.map((column) => (
              <th key={column.header} className={`${cellPadding} font-medium text-neutral-600`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-100'}>
              {columns.map((column) => (
                <td key={column.header} className={cellPadding}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 4.10 Toast.tsx

```tsx
import { useEffect } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  info: 'bg-primary text-white',
  warning: 'bg-warning text-neutral-900',
};

export function Toast({ message, variant = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`fixed right-4 top-4 z-50 rounded-md px-4 py-3 text-sm shadow-lg ${VARIANT_CLASSES[variant]}`}>
      {message}
    </div>
  );
}
```

### 4.11 WhatsAppNameModal.tsx

```tsx
import { useEffect, useRef, useState } from 'react';

interface WhatsAppNameModalProps {
  open: boolean;
  /** Nome já salvo (pré-preenche o campo) */
  initialName?: string | null;
  onConfirm: (name: string | null, remember: boolean) => void;
}

export function WhatsAppNameModal({ open, initialName, onConfirm }: WhatsAppNameModalProps) {
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync initialName when modal opens
  useEffect(() => {
    if (open) {
      setName(initialName ?? '');
      setRemember(!!initialName);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initialName]);

  // ESC to close (skip)
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onConfirm(null, false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onConfirm]);

  if (!open) return null;

  const trimmed = name.trim();
  const canSubmit = trimmed.length >= 2;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm(trimmed, remember);
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === overlayRef.current && onConfirm(null, false)}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-bold text-neutral-900">Quase lá! 😊</h2>
        <p className="mb-5 text-sm text-neutral-600">Como podemos te chamar?</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="wpp-name" className="sr-only">
              Seu nome
            </label>
            <input
              id="wpp-name"
              ref={inputRef}
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {name.length > 0 && name.trim().length < 2 && (
              <p className="mt-1 text-xs text-red-500">Mínimo 2 caracteres</p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-secondary"
            />
            Lembrar meu nome neste dispositivo
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-md bg-secondary py-3 text-sm font-semibold text-white
              transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuar para o WhatsApp
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => onConfirm(null, false)}
            className="text-xs text-neutral-400 underline hover:text-neutral-600 transition"
          >
            Pular
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. LAYOUT COMPONENTS

### 5.1 AdminLayout.tsx

Arquivo: `frontend/src/components/layout/AdminLayout.tsx`

```tsx
import { useRef, useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { GlobalSearch } from '../ui/GlobalSearch';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useQuery } from '@tanstack/react-query';
import { listRecentActivity } from '../../services/activityFeedService';
import { Button } from '../ui/Button';

const ADMIN_TITLES: Record<string, string> = {
  '/admin': 'Dashboard — MaxHub',
  '/admin/produtos': 'Produtos — MaxHub',
  '/admin/categorias': 'Categorias — MaxHub',
  '/admin/fornecedores': 'Fornecedores — MaxHub',
  '/admin/clientes': 'Clientes — MaxHub',
  '/admin/agenda': 'Agenda — MaxHub',
  '/admin/expedicao': 'Expedição — MaxHub',
  '/admin/financeiro': 'Financeiro — MaxHub',
  '/admin/pedidos': 'Pedidos — MaxHub',
  '/admin/romaneio': 'Romaneio — MaxHub',
  '/admin/rota-entrega': 'Rota de Entrega — MaxHub',
  '/admin/usuarios': 'Usuários — MaxHub',
  '/admin/relatorios': 'Relatórios — MaxHub',
  '/admin/previsao': 'Previsão Semanal — MaxHub',
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

const IconMenu = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { data: notifications } = useNotifications();
  const isAdmin = user?.role === 'ADMIN';
  const { data: recentActivity } = useQuery({
    queryKey: ['activity-feed-recent'],
    queryFn: () => listRecentActivity(5),
    enabled: isAdmin,
    staleTime: 60_000,
  });
  const [showBell, setShowBell] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const exact = ADMIN_TITLES[path];
    if (exact) {
      document.title = exact;
    } else if (path.startsWith('/admin/pedidos/')) {
      document.title = 'Pedido — MaxHub';
    } else if (path.startsWith('/admin/clientes/')) {
      document.title = 'Cliente — MaxHub';
    } else if (path.startsWith('/admin/produtos/')) {
      document.title = 'Produto — MaxHub';
    } else {
      document.title = 'MaxHub';
    }
  }, [location.pathname]);

  const badgeCount = (notifications?.newOrders ?? 0) + (notifications?.overdueContacts ?? 0) + (notifications?.schedulesToday ?? 0);

  useEffect(() => {
    if (!showBell) return;
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowBell(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showBell]);

  // Fecha drawer ao redimensionar para desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setDrawerOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-col md:w-60 shrink-0">
        <AdminSidebar />
      </div>

      {/* Drawer mobile — overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer mobile — painel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-200 md:hidden
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 280 }}
      >
        <AdminSidebar onClose={() => setDrawerOpen(false)} />
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-neutral-300 bg-white px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3">
            {/* Hamburguer mobile */}
            <button
              className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 transition md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
            >
              <IconMenu />
            </button>
            <span className="text-sm text-neutral-600 hidden sm:block">{user?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Busca global */}
            <button
              onClick={() => window.dispatchEvent(new Event('globalSearch:open'))}
              className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50
                px-2.5 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 transition"
              title="Busca global (Ctrl+K)"
            >
              🔍 <span className="hidden sm:inline">Buscar</span>
              <kbd className="hidden sm:inline rounded border border-neutral-200 px-1 text-[10px]">Ctrl+K</kbd>
            </button>

            {/* Sino de notificações */}
            <div ref={bellRef} className="relative">
              <button
                onClick={() => setShowBell((v) => !v)}
                className="relative flex h-8 w-8 items-center justify-center rounded-full
                  text-neutral-600 hover:bg-neutral-100 transition"
                aria-label="Notificações"
              >
                <span className="text-lg">🔔</span>
                {badgeCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center
                    justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </button>

              {showBell && (
                <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-neutral-200
                  bg-white shadow-xl max-h-[80vh] overflow-y-auto">
                  <div className="border-b border-neutral-100 px-4 py-3">
                    <p className="text-sm font-semibold text-neutral-900">Notificações</p>
                  </div>

                  {/* Pedidos novos */}
                  <div className="px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Pedidos novos ({notifications?.newOrders ?? 0})
                    </p>
                    {!notifications?.recentOrders?.length ? (
                      <p className="text-xs text-neutral-400">Nenhum pedido novo</p>
                    ) : (
                      <ul className="space-y-2">
                        {notifications.recentOrders.map((order) => (
                          <li key={order.id} className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-primary">{order.orderNumber}</p>
                              <p className="text-xs text-neutral-600">{order.customerName}</p>
                            </div>
                            <span className="whitespace-nowrap text-xs text-neutral-400">
                              {timeAgo(order.createdAt)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link to="/admin/expedicao" onClick={() => setShowBell(false)}
                      className="mt-2 block text-xs text-primary hover:underline">
                      Ver todos os pedidos →
                    </Link>
                  </div>

                  {/* Contatos de hoje */}
                  <div className="border-t border-neutral-100 px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Contatos de hoje ({notifications?.schedulesToday ?? 0})
                    </p>
                    {!notifications?.contactsToday?.length ? (
                      <p className="text-xs text-neutral-400">Nenhum contato hoje</p>
                    ) : (
                      <ul className="space-y-2">
                        {notifications.contactsToday.map((s) => (
                          <li key={s.scheduleId} className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-neutral-800">{s.customerName}</p>
                              {s.reason && <p className="text-xs text-neutral-500">{s.reason}</p>}
                            </div>
                            {s.phone && (
                              <a href={`https://api.whatsapp.com/send?phone=${s.phone.replace(/\D/g, '').replace(/^(?!55)/, '55')}`}
                                target="_blank" rel="noreferrer"
                                className="whitespace-nowrap text-xs text-green-600 hover:underline">
                                💬
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link to="/admin/agenda?period=today" onClick={() => setShowBell(false)}
                      className="mt-2 block text-xs text-primary hover:underline">
                      Ver agenda completa →
                    </Link>
                  </div>

                  {/* Contatos em atraso */}
                  <div className="border-t border-neutral-100 px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Contatos em atraso ({notifications?.overdueContacts ?? 0})
                    </p>
                    {!notifications?.overdueCustomers?.length ? (
                      <p className="text-xs text-neutral-400">Nenhum contato em atraso</p>
                    ) : (
                      <ul className="space-y-2">
                        {notifications.overdueCustomers.map((c) => (
                          <li key={c.id} className="flex items-start justify-between gap-2">
                            <p className="text-xs text-neutral-700">{c.name}</p>
                            <span className="whitespace-nowrap text-xs text-danger">
                              {formatDate(c.nextContactDate)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link to="/admin/agenda?period=overdue" onClick={() => setShowBell(false)}
                      className="mt-2 block text-xs text-primary hover:underline">
                      Ver agenda →
                    </Link>
                  </div>

                  {/* Feed de atividades — só ADMIN */}
                  {isAdmin && (
                    <div className="border-t border-neutral-100 px-4 py-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Atividades recentes
                      </p>
                      {!recentActivity?.length ? (
                        <p className="text-xs text-neutral-400">Nenhuma atividade</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {recentActivity.map((a) => (
                            <li key={a.id} className="text-xs text-neutral-700">
                              <span className="font-semibold">{a.userName}</span>
                              {' · '}{a.entityLabel ?? a.entityType}
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link to="/admin/atividades" onClick={() => setShowBell(false)}
                        className="mt-2 block text-xs text-primary hover:underline">
                        Ver todas as atividades →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={logout}>Sair</Button>
          </div>
        </header>

        <main className="flex-1 bg-neutral-100 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <GlobalSearch />
    </div>
  );
}
```

### 5.2 AdminSidebar.tsx

Arquivo: `frontend/src/components/layout/AdminSidebar.tsx`

```tsx
import { NavLink } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';

type NavItem = {
  to: string;
  label: string;
  showBadge?: boolean;
  icon: React.ReactNode;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

const IconDashboard = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconOrders = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);
const IconTruck = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const IconCalendar = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconBox = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
  </svg>
);
const IconTag = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <circle cx="7" cy="7" r="1.5" />
  </svg>
);
const IconUsers = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconSupplier = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconWallet = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M21 12V7H5a2 2 0 010-4h14v4" />
    <path d="M3 5v14a2 2 0 002 2h16v-5" />
    <circle cx="18" cy="14" r="2" />
  </svg>
);
const IconChart = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IconUserCog = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconTrend = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconActivity = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconX = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const ADMIN_GROUPS: NavGroup[] = [
  {
    group: 'OPERAÇÃO',
    items: [
      { to: '/admin', label: 'Dashboard', icon: <IconDashboard /> },
      { to: '/admin/pedidos', label: 'Pedidos', icon: <IconOrders /> },
      { to: '/admin/expedicao', label: 'Expedição', showBadge: true, icon: <IconTruck /> },
      { to: '/admin/romaneio', label: 'Romaneio', icon: <IconBox /> },
      { to: '/admin/rota-entrega', label: 'Rota de Entrega', icon: <IconTruck /> },
      { to: '/admin/agenda', label: 'Agenda', icon: <IconCalendar /> },
      { to: '/admin/previsao', label: 'Previsão Semanal', icon: <IconTrend /> },
    ],
  },
  {
    group: 'CADASTROS',
    items: [
      { to: '/admin/produtos', label: 'Produtos', icon: <IconBox /> },
      { to: '/admin/categorias', label: 'Categorias', icon: <IconTag /> },
      { to: '/admin/clientes', label: 'Clientes', icon: <IconUsers /> },
      { to: '/admin/fornecedores', label: 'Fornecedores', icon: <IconSupplier /> },
    ],
  },
  {
    group: 'FINANCEIRO',
    items: [
      { to: '/admin/financeiro', label: 'Financeiro', icon: <IconWallet /> },
      { to: '/admin/relatorios', label: 'Relatórios', icon: <IconChart /> },
    ],
  },
  {
    group: 'SISTEMA',
    items: [
      { to: '/admin/usuarios', label: 'Usuários', icon: <IconUserCog /> },
      { to: '/admin/atividades', label: 'Atividades', icon: <IconActivity /> },
    ],
  },
];

const VENDEDOR_GROUPS: NavGroup[] = [
  {
    group: 'OPERAÇÃO',
    items: [
      { to: '/admin/painel', label: 'Meu Painel', icon: <IconDashboard /> },
      { to: '/admin/pedidos', label: 'Pedidos', icon: <IconOrders /> },
      { to: '/admin/expedicao', label: 'Expedição', showBadge: true, icon: <IconTruck /> },
      { to: '/admin/agenda', label: 'Agenda', icon: <IconCalendar /> },
    ],
  },
  {
    group: 'CADASTROS',
    items: [
      { to: '/admin/clientes', label: 'Clientes', icon: <IconUsers /> },
    ],
  },
  {
    group: 'RELATÓRIOS',
    items: [
      { to: '/admin/meus-relatorios', label: 'Minhas Vendas', icon: <IconChart /> },
    ],
  },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const { data: notifications } = useNotifications();
  const { user } = useAuth();
  const activeOrders = notifications?.activeOrdersTotal ?? 0;

  const groups = user?.role === 'VENDEDOR' ? VENDEDOR_GROUPS : ADMIN_GROUPS;

  function handleNavClick() {
    onClose?.();
  }

  return (
    <aside className="flex h-full w-70 flex-col border-r border-neutral-300 bg-white p-4">
      <div className="mb-5 flex items-center justify-between">
        <p className="px-3 text-lg font-bold text-primary">CentralMax</p>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 transition md:hidden"
            aria-label="Fechar menu"
          >
            <IconX />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-4 overflow-y-auto text-sm font-medium text-neutral-900">
        {groups.map((group) => (
          <div key={group.group}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              {group.group}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/admin' || link.to === '/admin/painel'}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-md px-3 py-2
                    ${isActive ? 'bg-primary text-white' : 'hover:bg-neutral-100'}`
                  }
                >
                  <span className="flex items-center gap-2">
                    {link.icon}
                    {link.label}
                  </span>
                  {link.showBadge && activeOrders > 0 && (
                    <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {activeOrders > 99 ? '99+' : activeOrders}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {user?.role === 'VENDEDOR' && (
        <div className="mt-auto pt-4">
          <p className="px-3 text-xs text-neutral-400">
            Vendedor
            {user.territory && <span className="ml-1">· {user.territory}</span>}
          </p>
        </div>
      )}
    </aside>
  );
}
```

### 5.3 Header.tsx (layout público — equivalente ao "AdminHeader")

> Não existe `AdminHeader.tsx` — o header da área administrativa está embutido dentro do próprio `AdminLayout.tsx` (ver seção 5.1). O arquivo `Header.tsx` abaixo é o header do site público (loja/catálogo).

Arquivo: `frontend/src/components/layout/Header.tsx`

```tsx
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { itemCount } = useCart();

  return (
    <header className="bg-primary">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-white">
          CentralMax Embalagens
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-white/90">
          <Link to="/catalogo" className="hover:text-white transition-colors">
            Catálogo
          </Link>
          <Link to="/orcamento" className="hover:text-white transition-colors">
            Orçamento
          </Link>
          <button onClick={onCartClick} className="relative" aria-label="Abrir carrinho">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
```

---

## 6. MANIFEST PWA

Arquivo: `frontend/public/manifest.json`

```json
{
  "name": "MaxHub — CentralMax",
  "short_name": "MaxHub",
  "description": "Sistema comercial CentralMax Embalagens",
  "start_url": "/admin",
  "display": "standalone",
  "background_color": "#0f1f3d",
  "theme_color": "#f97316",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## 7. INDEX HTML

Arquivo: `frontend/index.html`

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MaxHub — CentralMax Embalagens</title>
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#f97316" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="MaxHub" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" href="/icons/icon-192.png" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <style>
      #splash {
        position: fixed;
        inset: 0;
        background: #0f1f3d;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
      }
      #splash.hidden {
        opacity: 0;
        pointer-events: none;
      }
      #splash-box {
        animation: spin3d 1.5s ease-in-out infinite;
        transform-origin: center;
      }
      @keyframes spin3d {
        0%   { transform: rotateY(0deg) scale(1); }
        25%  { transform: rotateY(90deg) scale(0.8); }
        50%  { transform: rotateY(180deg) scale(1); }
        75%  { transform: rotateY(270deg) scale(0.8); }
        100% { transform: rotateY(360deg) scale(1); }
      }
      #splash-text {
        color: white;
        font-family: sans-serif;
        font-size: 22px;
        font-weight: 600;
        margin-top: 20px;
        letter-spacing: 1px;
      }
      #splash-sub {
        color: #f97316;
        font-family: sans-serif;
        font-size: 13px;
        margin-top: 6px;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <div id="splash">
      <svg id="splash-box" width="80" height="80" viewBox="0 0 32 32">
        <polygon points="16,2 30,9 16,16 2,9" fill="#f97316"/>
        <polygon points="2,9 16,16 16,28 2,21" fill="#1e3a6e"/>
        <polygon points="30,9 16,16 16,28 30,21" fill="#2a4f8f"/>
      </svg>
      <div id="splash-text">MaxHub</div>
      <div id="splash-sub">CentralMax Embalagens</div>
    </div>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script>
      window.addEventListener('load', function () {
        setTimeout(function () {
          var splash = document.getElementById('splash');
          if (splash) {
            splash.classList.add('hidden');
            setTimeout(function () { splash.remove(); }, 500);
          }
        }, 800);
      });
    </script>
  </body>
</html>
```

---

## 8. DEPENDÊNCIAS

Do `frontend/package.json` — dependências relacionadas ao visual / UI:

### `dependencies`
| Pacote | Versão | Papel visual |
|---|---|---|
| `react` | `^19.2.7` | Base da UI |
| `react-dom` | `^19.2.7` | Renderização DOM |
| `react-router-dom` | `^7.18.0` | Roteamento (afeta layout/transições de página) |
| `react-hook-form` | `^7.80.0` | Formulários (Input/Select acoplados a estados de erro visual) |
| `recharts` | `^3.9.1` | Gráficos (dashboard, previsão semanal, relatórios) |
| `@tanstack/react-query` | `^5.101.2` | Data-fetching (estados de loading que afetam UI) |
| `axios` | `^1.18.1` | HTTP client (não visual diretamente, mas alimenta os componentes) |

### `devDependencies`
| Pacote | Versão | Papel visual |
|---|---|---|
| `tailwindcss` | `^3.4.19` | Framework CSS utilitário — base de todo o design system |
| `autoprefixer` | `^10.5.2` | Suporte a vendor prefixes do CSS gerado pelo Tailwind |
| `postcss` | `^8.5.16` | Pipeline de processamento do CSS/Tailwind |
| `sharp` | `^0.35.3` | Processamento de imagens (geração dos ícones PWA) |
| `@types/react` | `^19.2.17` | Tipagem |
| `@types/react-dom` | `^19.2.3` | Tipagem |

**Observação importante:** o projeto **não usa `lucide-react`** nem qualquer outra biblioteca de ícones — todos os ícones são SVGs inline escritos à mão (ver seção 3).

---

## 9. SCRIPT DE INSTALAÇÃO

Reprodução das dependências visuais/UI atualmente usadas no projeto (versões conforme `package.json`):

```bash
# Dependências de runtime relacionadas ao visual/UI
npm install react@^19.2.7 react-dom@^19.2.7 react-router-dom@^7.18.0 react-hook-form@^7.80.0 recharts@^3.9.1 @tanstack/react-query@^5.101.2 axios@^1.18.1

# Dependências de desenvolvimento (build/estilo)
npm install -D tailwindcss@^3.4.19 autoprefixer@^10.5.2 postcss@^8.5.16 sharp@^0.35.3 @types/react@^19.2.17 @types/react-dom@^19.2.3
```

> Se for recriar o design system em um projeto novo do zero (sem herdar `package.json`), rode `npx tailwindcss init -p` para gerar `tailwind.config.ts`/`postcss.config.js`, depois cole o conteúdo da seção 1 no config e o da seção 2 no CSS global do projeto.

---

*Documento gerado a partir da leitura direta dos arquivos-fonte do MaxHub em 2026-07-22.*
