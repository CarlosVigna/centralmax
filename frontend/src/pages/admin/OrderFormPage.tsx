import axios from 'axios';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { createOrder } from '../../services/orderService';
import { listCustomers } from '../../services/customerService';
import { listAdminProducts } from '../../services/productService';
import type { Customer } from '../../types/customer';
import type { ProductAdmin } from '../../types/product';
import type { OrderItemRequest } from '../../types/order';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export function OrderFormPage() {
  const navigate = useNavigate();

  // Customer mode
  const [customerMode, setCustomerMode] = useState<'registered' | 'walkin'>('registered');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');

  // Product selection
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Notes
  const [notes, setNotes] = useState('');

  // Customer search query (only when mode=registered and there's a search term)
  const { data: customerResults } = useQuery({
    queryKey: ['customers-search', customerSearch],
    queryFn: () => listCustomers({ search: customerSearch, size: 8 }),
    enabled: customerMode === 'registered' && customerSearch.length >= 2,
  });

  // Products query
  const { data: productsData } = useQuery({
    queryKey: ['admin-products-active', productSearch],
    queryFn: () =>
      listAdminProducts({ status: 'ATIVO', search: productSearch || undefined, size: 100 }),
  });

  const products = productsData?.content ?? [];

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => navigate(`/admin/pedidos/${order.id}`),
  });

  function addItem() {
    if (!selectedProduct || quantity < 1) return;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === selectedProductId);
      if (existing) {
        return prev.map((i) =>
          i.productId === selectedProductId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity,
          unitPrice: selectedProduct.priceC,
        },
      ];
    });
    setSelectedProductId('');
    setQuantity(1);
  }

  function removeItem(productId: string) {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  const total = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const items: OrderItemRequest[] = cartItems.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    if (customerMode === 'registered') {
      if (!selectedCustomer) {
        alert('Selecione um cliente cadastrado ou mude para pedido avulso.');
        return;
      }
      createMutation.mutate({
        customerId: selectedCustomer.id,
        notes: notes || undefined,
        items,
      });
    } else {
      if (!walkinName.trim()) {
        alert('Informe o nome do cliente.');
        return;
      }
      createMutation.mutate({
        customerName: walkinName.trim(),
        customerPhone: walkinPhone.trim() || undefined,
        notes: notes || undefined,
        items,
      });
    }
  }

  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/pedidos" className="text-sm text-primary hover:underline">
          ← Pedidos
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Novo pedido</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Cliente ── */}
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Cliente
          </h2>

          <div className="mb-4 flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                checked={customerMode === 'registered'}
                onChange={() => {
                  setCustomerMode('registered');
                  setSelectedCustomer(null);
                  setCustomerSearch('');
                }}
              />
              Cliente cadastrado
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                checked={customerMode === 'walkin'}
                onChange={() => {
                  setCustomerMode('walkin');
                  setSelectedCustomer(null);
                  setCustomerSearch('');
                }}
              />
              Pedido avulso
            </label>
          </div>

          {customerMode === 'registered' ? (
            <div className="space-y-3">
              {selectedCustomer ? (
                <div className="flex items-center justify-between rounded-md border border-success/40 bg-success/5 px-3 py-2">
                  <div>
                    <p className="font-medium text-neutral-900">{selectedCustomer.name}</p>
                    {selectedCustomer.phone && (
                      <p className="text-xs text-neutral-600">{selectedCustomer.phone}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch('');
                    }}
                  >
                    Trocar
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Buscar cliente por nome, e-mail ou telefone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {customerResults && customerResults.content.length > 0 && (
                    <ul className="rounded-md border border-neutral-300 bg-white shadow-sm">
                      {customerResults.content.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
                            onClick={() => {
                              setSelectedCustomer(c);
                              setCustomerSearch('');
                            }}
                          >
                            <span className="font-medium">{c.name}</span>
                            {c.phone && (
                              <span className="ml-2 text-neutral-500">{c.phone}</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {customerSearch.length >= 2 &&
                    customerResults?.content.length === 0 && (
                      <p className="text-xs text-neutral-500">
                        Nenhum cliente encontrado.
                      </p>
                    )}
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nome *"
                placeholder="Nome do cliente"
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
              />
              <Input
                label="Telefone"
                placeholder="(00) 00000-0000"
                value={walkinPhone}
                onChange={(e) => setWalkinPhone(e.target.value)}
              />
            </div>
          )}
        </Card>

        {/* ── Produtos ── */}
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Itens do pedido
          </h2>

          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-neutral-900">
                Produto
              </label>
              <Input
                placeholder="Filtrar produtos..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="mb-2"
              />
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              >
                <option value="">Selecione um produto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.priceC)}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="mb-1 block text-sm font-medium text-neutral-900">
                Qtd
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              disabled={!selectedProductId}
            >
              Adicionar
            </Button>
          </div>

          {cartItems.length > 0 ? (
            <div className="overflow-hidden rounded-md border border-neutral-200">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium text-neutral-600">Produto</th>
                    <th className="px-3 py-2 font-medium text-neutral-600">Qtd</th>
                    <th className="px-3 py-2 font-medium text-neutral-600">Unit.</th>
                    <th className="px-3 py-2 font-medium text-neutral-600">Subtotal</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {cartItems.map((item) => (
                    <tr key={item.productId}>
                      <td className="px-3 py-2 font-medium text-neutral-900">
                        {item.productName}
                      </td>
                      <td className="px-3 py-2 text-neutral-700">{item.quantity}</td>
                      <td className="px-3 py-2 text-neutral-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-3 py-2 font-medium text-neutral-900">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-xs text-danger hover:underline"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end border-t border-neutral-200 px-3 py-2">
                <span className="text-base font-bold text-neutral-900">
                  Total: {formatCurrency(total)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              Nenhum item adicionado. Selecione um produto acima.
            </p>
          )}
        </Card>

        {/* ── Observações ── */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Observações
          </h2>
          <textarea
            rows={3}
            placeholder="Observações internas sobre o pedido (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </Card>

        {createMutation.isError && (
          <p className="text-sm text-danger">
            {axios.isAxiosError(createMutation.error)
              ? (createMutation.error.response?.data?.message ?? 'Erro ao criar pedido.')
              : 'Erro ao criar pedido.'}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Link to="/admin/pedidos">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={cartItems.length === 0 || createMutation.isPending}
          >
            {createMutation.isPending ? 'Salvando...' : 'Criar pedido'}
          </Button>
        </div>
      </form>
    </div>
  );
}
