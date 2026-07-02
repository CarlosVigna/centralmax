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
