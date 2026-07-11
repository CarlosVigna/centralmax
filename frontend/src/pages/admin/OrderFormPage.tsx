import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { createOrder, updateOrder, getOrder } from '../../services/orderService';
import { listCustomers, getCustomer } from '../../services/customerService';
import { formatCurrency as fmtCur } from '../../utils/formatCurrency';
import { listAdminProducts } from '../../services/productService';
import type { Customer, CustomerType } from '../../types/customer';
import type { OrderItemRequest, PaymentCondition } from '../../types/order';
import { PAYMENT_CONDITION_LABELS } from '../../types/order';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

const PRICE_LABEL: Record<CustomerType, string> = {
  A: 'Preço A (atacado)',
  B: 'Preço B (intermediário)',
  C: 'Preço C (varejo)',
};

function getProductPrice(
  product: { priceA: number; priceB: number; priceC: number },
  type: CustomerType,
): number {
  if (type === 'A') return product.priceA;
  if (type === 'B') return product.priceB;
  return product.priceC;
}

function applyDiscount(price: number, discount: number): number {
  if (!discount) return price;
  return Math.round(price * (1 - discount / 100) * 100) / 100;
}

export function OrderFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: editId } = useParams<{ id: string }>();
  const isEdit = !!editId;
  const preloadCustomerId = searchParams.get('customerId');

  const [customerMode, setCustomerMode] = useState<'registered' | 'walkin'>('registered');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');

  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [nfNumber, setNfNumber] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [paymentCondition, setPaymentCondition] = useState<PaymentCondition>('NA_ENTREGA');
  const [editOrderNumber, setEditOrderNumber] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const customerType: CustomerType = selectedCustomer?.customerType ?? 'C';

  // Load existing order for edit mode
  const { data: existingOrder } = useQuery({
    queryKey: ['order', editId],
    queryFn: () => getOrder(editId!),
    enabled: isEdit,
  });

  // Pre-load customer from URL param (create mode only)
  const { data: preloadedCustomer } = useQuery({
    queryKey: ['customer', preloadCustomerId],
    queryFn: () => getCustomer(preloadCustomerId!),
    enabled: !!preloadCustomerId && !selectedCustomer && !isEdit,
  });

  const { data: customerResults } = useQuery({
    queryKey: ['customers-search', customerSearch],
    queryFn: () => listCustomers({ search: customerSearch, size: 8 }),
    enabled: customerMode === 'registered' && customerSearch.length >= 2,
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin-products-active', productSearch],
    queryFn: () =>
      listAdminProducts({ status: 'ATIVO', search: productSearch || undefined, size: 100 }),
  });

  const products = productsData?.content ?? [];
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Populate form from existing order (edit mode)
  useEffect(() => {
    if (!existingOrder || initialized) return;
    setEditOrderNumber(existingOrder.orderNumber ?? null);
    setNotes(existingOrder.notes ?? '');
    setNfNumber(existingOrder.nfNumber ?? '');
    setEstimatedDeliveryDate(existingOrder.estimatedDeliveryDate ?? '');
    setPaymentCondition(existingOrder.paymentCondition ?? 'NA_ENTREGA');

    if (existingOrder.customerId) {
      setCustomerMode('registered');
      getCustomer(existingOrder.customerId).then((c) => setSelectedCustomer(c)).catch(() => {});
    } else {
      setCustomerMode('walkin');
      setWalkinName(existingOrder.customerDisplayName ?? '');
      setWalkinPhone(existingOrder.customerDisplayPhone ?? '');
    }

    if (existingOrder.items) {
      setCartItems(
        existingOrder.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent ?? 0,
        })),
      );
    }
    setInitialized(true);
  }, [existingOrder, initialized]);

  // Populate from URL param (create mode)
  useEffect(() => {
    if (preloadedCustomer && !selectedCustomer && !isEdit) {
      setSelectedCustomer(preloadedCustomer);
    }
  }, [preloadedCustomer, selectedCustomer, isEdit]);

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => navigate(`/admin/pedidos/${order.id}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: Parameters<typeof updateOrder>[1] }) =>
      updateOrder(id, request),
    onSuccess: (order) => navigate(`/admin/pedidos/${order.id}`),
  });

  const mutation = isEdit ? updateMutation : createMutation;

  function addItem() {
    if (!selectedProduct || quantity < 1) return;
    const price = getProductPrice(selectedProduct, customerType);
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === selectedProductId);
      if (existing) {
        return prev.map((i) =>
          i.productId === selectedProductId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity,
          unitPrice: price,
          discountPercent: discount,
        },
      ];
    });
    setSelectedProductId('');
    setQuantity(1);
    setDiscount(0);
  }

  function removeItem(productId: string) {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateItemDiscount(productId: string, newDiscount: number) {
    setCartItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, discountPercent: newDiscount } : i)),
    );
  }

  // Recalculate prices when customer type changes
  useEffect(() => {
    if (cartItems.length === 0 || products.length === 0) return;
    setCartItems((prev) =>
      prev.map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return item;
        return { ...item, unitPrice: getProductPrice(prod, customerType) };
      }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerType]);

  const total = cartItems.reduce(
    (sum, i) => sum + applyDiscount(i.unitPrice, i.discountPercent) * i.quantity,
    0,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const items: OrderItemRequest[] = cartItems.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      discountPercent: i.discountPercent || undefined,
    }));

    if (customerMode === 'registered') {
      if (!selectedCustomer) {
        alert('Selecione um cliente cadastrado ou mude para pedido avulso.');
        return;
      }
      const payload = {
        customerId: selectedCustomer.id,
        notes: notes || undefined,
        nfNumber: nfNumber.trim() || undefined,
        estimatedDeliveryDate: estimatedDeliveryDate || undefined,
        items,
        paymentCondition,
      };
      if (isEdit) {
        updateMutation.mutate({ id: editId!, request: payload });
      } else {
        createMutation.mutate(payload);
      }
    } else {
      if (!walkinName.trim()) {
        alert('Informe o nome do cliente.');
        return;
      }
      const payload = {
        customerName: walkinName.trim(),
        customerPhone: walkinPhone.trim() || undefined,
        notes: notes || undefined,
        nfNumber: nfNumber.trim() || undefined,
        estimatedDeliveryDate: estimatedDeliveryDate || undefined,
        items,
        paymentCondition,
      };
      if (isEdit) {
        updateMutation.mutate({ id: editId!, request: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  }

  const fmtCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const pageTitle = isEdit
    ? `Editar Pedido${editOrderNumber ? ` #${editOrderNumber}` : ''}`
    : 'Novo pedido';

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/pedidos" className="text-sm text-primary hover:underline">
          ← Pedidos
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">{pageTitle}</h1>
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
                }}
              />
              Pedido avulso
            </label>
          </div>

          {customerMode === 'registered' ? (
            <div className="space-y-3">
              {selectedCustomer ? (
                <div>
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
                      onClick={() => setSelectedCustomer(null)}
                    >
                      Trocar
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-primary">
                    Usando {PRICE_LABEL[customerType]}
                  </p>
                  {selectedCustomer.overdueAmount != null && selectedCustomer.overdueAmount > 0 && (
                    <div className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                      ⚠️ Cliente com {selectedCustomer.overdueCount} título(s) vencido(s) no valor de{' '}
                      <strong>{fmtCur(selectedCustomer.overdueAmount)}</strong>
                    </div>
                  )}
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
                              setCustomerSearch('');
                              getCustomer(c.id).then(setSelectedCustomer).catch(() => setSelectedCustomer(c));
                            }}
                          >
                            <span className="font-medium">{c.name}</span>
                            {c.phone && (
                              <span className="ml-2 text-neutral-500">{c.phone}</span>
                            )}
                            <span className="ml-2 text-xs text-neutral-400">
                              Tipo {c.customerType}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {customerSearch.length >= 2 && customerResults?.content.length === 0 && (
                    <p className="text-xs text-neutral-500">Nenhum cliente encontrado.</p>
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
              <label className="mb-1 block text-sm font-medium text-neutral-900">Produto</label>
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
                    {p.name} — {fmtCurrency(getProductPrice(p, customerType))}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-20">
              <label className="mb-1 block text-sm font-medium text-neutral-900">Qtd</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-sm font-medium text-neutral-900">Desc %</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <Button type="button" variant="outline" onClick={addItem} disabled={!selectedProductId}>
              Adicionar
            </Button>
          </div>

          {selectedProduct && (
            <p className="mb-3 text-xs text-primary">
              Preço: {fmtCurrency(getProductPrice(selectedProduct, customerType))}
              {discount > 0 && (
                <>
                  {' '}→{' '}
                  {fmtCurrency(applyDiscount(getProductPrice(selectedProduct, customerType), discount))}
                  {' '}(-{discount}%)
                </>
              )}
              {' '}· {PRICE_LABEL[customerType]}
            </p>
          )}

          {cartItems.length > 0 ? (
            <div className="overflow-hidden rounded-md border border-neutral-200">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium text-neutral-600">Produto</th>
                    <th className="px-3 py-2 font-medium text-neutral-600">Qtd</th>
                    <th className="px-3 py-2 font-medium text-neutral-600">Unit.</th>
                    <th className="px-3 py-2 font-medium text-neutral-600">Desc %</th>
                    <th className="px-3 py-2 font-medium text-neutral-600">Subtotal</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {cartItems.map((item) => {
                    const finalPrice = applyDiscount(item.unitPrice, item.discountPercent);
                    const subtotal = finalPrice * item.quantity;
                    return (
                      <tr key={item.productId}>
                        <td className="px-3 py-2 font-medium text-neutral-900">{item.productName}</td>
                        <td className="px-3 py-2 text-neutral-700">{item.quantity}</td>
                        <td className="px-3 py-2 text-neutral-700">{fmtCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-1.5">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={item.discountPercent}
                            onChange={(e) => updateItemDiscount(item.productId, Number(e.target.value))}
                            className="w-16 rounded border border-neutral-300 px-2 py-1 text-sm"
                          />
                          <span className="ml-1 text-xs text-neutral-500">%</span>
                        </td>
                        <td className="px-3 py-2 font-medium text-neutral-900">
                          {fmtCurrency(subtotal)}
                          {item.discountPercent > 0 && (
                            <span className="ml-1 text-xs text-green-600">
                              (-{item.discountPercent}%)
                            </span>
                          )}
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
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-end border-t border-neutral-200 px-3 py-2">
                <span className="text-base font-bold text-neutral-900">
                  Total: {fmtCurrency(total)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              Nenhum item adicionado. Selecione um produto acima.
            </p>
          )}
        </Card>

        {/* ── Condição de pagamento ── */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Condição de pagamento
          </h2>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PAYMENT_CONDITION_LABELS) as PaymentCondition[]).map((key) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-neutral-50">
                <input
                  type="radio"
                  name="paymentCondition"
                  value={key}
                  checked={paymentCondition === key}
                  onChange={() => setPaymentCondition(key)}
                />
                {PAYMENT_CONDITION_LABELS[key]}
              </label>
            ))}
          </div>
        </Card>

        {/* ── NF + Prazo ── */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            NF e Prazo de Entrega
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Número da NF"
              placeholder="Ex: 000123"
              value={nfNumber}
              onChange={(e) => setNfNumber(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-900">Previsão de Entrega</label>
              <input
                type="date"
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
          </div>
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

        {mutation.isError && (
          <p className="text-sm text-danger">
            {axios.isAxiosError(mutation.error)
              ? (mutation.error.response?.data?.message ?? 'Erro ao salvar pedido.')
              : 'Erro ao salvar pedido.'}
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
            disabled={cartItems.length === 0 || mutation.isPending}
          >
            {mutation.isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar pedido'}
          </Button>
        </div>
      </form>
    </div>
  );
}
