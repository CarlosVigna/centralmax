import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProductPhotoUpload } from '../../components/admin/ProductPhotoUpload';
import { ProductVariationEditor } from '../../components/admin/ProductVariationEditor';
import { ProductCardPreview } from '../../components/admin/ProductCardPreview';
import { listCategories } from '../../services/categoryService';
import { listSuppliers } from '../../services/supplierService';
import {
  createProduct, getAdminProduct, updateProduct,
  getProductDiscounts, createProductDiscount, deleteProductDiscount,
  getProductPriceHistory,
} from '../../services/productService';
import type { ProductRequest } from '../../types/product';

function fmtPrice(v: number | null | undefined) {
  if (v == null) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface ProductFormValues {
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  supplierId: string;
  purchasePrice: string;
  minQuantity: string;
  priceA: string;
  priceB: string;
  priceC: string;
  mainImageUrl: string;
}

function calcPrice(purchasePrice: string, margin: string): string {
  const pc = parseFloat(purchasePrice);
  const m = parseFloat(margin);
  if (!pc || pc <= 0 || isNaN(m)) return '';
  return (pc * (1 + m / 100)).toFixed(2);
}

function calcMargin(purchasePrice: string, price: string): string {
  const pc = parseFloat(purchasePrice);
  const p = parseFloat(price);
  if (!pc || pc <= 0 || !p || p <= 0) return '';
  return (((p / pc) - 1) * 100).toFixed(1);
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const productQueryKey = ['admin-product', id];

  // Local state for margins (derived, not stored in DB)
  const [marginA, setMarginA] = useState('5.0');
  const [marginB, setMarginB] = useState('10.0');
  const [marginC, setMarginC] = useState('15.0');
  const [discountMinQty, setDiscountMinQty] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    staleTime: 1000 * 60 * 10,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: listSuppliers,
    staleTime: 1000 * 60 * 10,
  });

  const { data: existing, isLoading: loadingProduct } = useQuery({
    queryKey: productQueryKey,
    queryFn: () => getAdminProduct(id!),
    enabled: isEditing,
  });

  const { data: discounts = [], refetch: refetchDiscounts } = useQuery({
    queryKey: ['product-discounts', id],
    queryFn: () => getProductDiscounts(id!),
    enabled: isEditing,
  });

  const { data: priceHistory = [] } = useQuery({
    queryKey: ['product-price-history', id],
    queryFn: () => getProductPriceHistory(id!),
    enabled: isEditing && showPriceHistory,
  });

  const addDiscountMutation = useMutation({
    mutationFn: () => createProductDiscount(id!, {
      minQuantity: parseInt(discountMinQty),
      discountPercent: parseFloat(discountPercent),
    }),
    onSuccess: () => { refetchDiscounts(); setDiscountMinQty(''); setDiscountPercent(''); },
  });

  const deleteDiscountMutation = useMutation({
    mutationFn: (discountId: string) => deleteProductDiscount(id!, discountId),
    onSuccess: () => refetchDiscounts(),
  });

  const { register, handleSubmit, reset, control, setValue, formState } = useForm<ProductFormValues>({
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      categoryId: '',
      supplierId: '',
      purchasePrice: '',
      minQuantity: '1',
      priceA: '',
      priceB: '',
      priceC: '',
      mainImageUrl: '',
    },
  });

  // Watch fields for preview and calculations
  const watchedName = useWatch({ control, name: 'name' });
  const watchedDesc = useWatch({ control, name: 'description' });
  const watchedPriceA = useWatch({ control, name: 'priceA' });
  const watchedPriceB = useWatch({ control, name: 'priceB' });
  const watchedPriceC = useWatch({ control, name: 'priceC' });
  const watchedCategoryId = useWatch({ control, name: 'categoryId' });
  const watchedImageUrl = useWatch({ control, name: 'mainImageUrl' });
  const watchedPurchasePrice = useWatch({ control, name: 'purchasePrice' });

  useEffect(() => {
    if (existing) {
      reset({
        sku: existing.sku ?? '',
        name: existing.name,
        description: existing.description ?? '',
        categoryId: existing.categoryId,
        supplierId: existing.supplierId ?? '',
        purchasePrice: existing.purchasePrice ? String(existing.purchasePrice) : '',
        minQuantity: String(existing.minQuantity ?? 1),
        priceA: String(existing.priceA),
        priceB: String(existing.priceB),
        priceC: String(existing.priceC),
        mainImageUrl: existing.mainImageUrl ?? '',
      });
      // Back-calculate margins from existing purchase price
      if (existing.purchasePrice && existing.purchasePrice > 0) {
        const pc = existing.purchasePrice;
        setMarginA((((existing.priceA / pc) - 1) * 100).toFixed(1));
        setMarginB((((existing.priceB / pc) - 1) * 100).toFixed(1));
        setMarginC((((existing.priceC / pc) - 1) * 100).toFixed(1));
      }
    }
  }, [existing, reset]);

  const saveMutation = useMutation({
    mutationFn: (request: ProductRequest) =>
      isEditing ? updateProduct(id!, request) : createProduct(request),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (!isEditing) {
        navigate(`/admin/produtos/${saved.id}/editar`);
      }
    },
  });

  function onSubmit(values: ProductFormValues) {
    const request: ProductRequest = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      categoryId: values.categoryId,
      supplierId: values.supplierId || undefined,
      sku: values.sku.trim() || undefined,
      purchasePrice: values.purchasePrice ? parseFloat(values.purchasePrice) : undefined,
      minQuantity: values.minQuantity ? parseInt(values.minQuantity) : undefined,
      priceA: parseFloat(values.priceA),
      priceB: parseFloat(values.priceB),
      priceC: parseFloat(values.priceC),
      mainImageUrl: values.mainImageUrl.trim() || undefined,
    };
    saveMutation.mutate(request);
  }

  const categoryOptions = [
    { value: '', label: 'Selecione uma categoria...' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const supplierOptions = [
    { value: '', label: 'Nenhum fornecedor' },
    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
  ];

  const previewCategory = categories.find((c) => c.id === watchedCategoryId)?.name ?? '';
  const previewImage = (isEditing && existing?.photos?.[0]?.url) || watchedImageUrl || null;

  // Price order validation (computed at top level — no conditional hooks)
  const priceANum = parseFloat(watchedPriceA) || 0;
  const priceBNum = parseFloat(watchedPriceB) || 0;
  const priceCNum = parseFloat(watchedPriceC) || 0;
  const priceOrderErrors: string[] = [];
  if (priceANum > 0 && priceBNum > 0 && priceBNum < priceANum)
    priceOrderErrors.push('Preço B (intermediário) deve ser ≥ Preço A (atacado)');
  if (priceBNum > 0 && priceCNum > 0 && priceCNum < priceBNum)
    priceOrderErrors.push('Preço C (varejo) deve ser ≥ Preço B (intermediário)');

  if (isEditing && loadingProduct) {
    return <p className="text-sm text-neutral-600">Carregando produto...</p>;
  }

  return (
    <div className="xl:flex xl:gap-8">
      {/* ── Main content ── */}
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          {isEditing ? 'Editar produto' : 'Novo produto'}
        </h1>

        {/* ── Dados principais ── */}
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Dados do produto
          </h2>
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="SKU (código)"
                id="sku"
                placeholder="Ex: 100638"
                {...register('sku', {
                  maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                })}
                error={formState.errors.sku?.message}
              />
              <Input
                label="Nome *"
                id="name"
                {...register('name', {
                  required: 'Nome é obrigatório',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                  maxLength: { value: 160, message: 'Máximo 160 caracteres' },
                })}
                error={formState.errors.name?.message}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium text-neutral-900">
                Descrição
              </label>
              <textarea
                id="description"
                rows={3}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                {...register('description')}
              />
            </div>

            <Select
              label="Categoria *"
              id="categoryId"
              options={categoryOptions}
              {...register('categoryId', { required: 'Categoria é obrigatória' })}
              error={formState.errors.categoryId?.message}
            />

            <Select
              label="Fornecedor"
              id="supplierId"
              options={supplierOptions}
              {...register('supplierId')}
            />

            <Input
              label="URL da imagem (legado)"
              id="mainImageUrl"
              type="url"
              placeholder="https://... (use upload de foto abaixo)"
              {...register('mainImageUrl', {
                maxLength: { value: 500, message: 'Máximo 500 caracteres' },
              })}
              error={formState.errors.mainImageUrl?.message}
              helperText="Opcional — prefira fazer upload de fotos abaixo"
            />

            {saveMutation.isError && (
              <p className="text-sm text-danger">
                {axios.isAxiosError(saveMutation.error)
                  ? (saveMutation.error.response?.data?.message ?? 'Erro ao salvar. Tente novamente.')
                  : 'Erro ao salvar. Tente novamente.'}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                form="product-form"
                disabled={formState.isSubmitting || saveMutation.isPending}
              >
                {isEditing ? 'Salvar alterações' : 'Criar e continuar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/produtos')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>

        {/* ── Precificação ── */}
        <Card>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Precificação
          </h2>
          <p className="mb-4 text-xs text-neutral-400">
            Digite o preço de compra e as margens para calcular os preços automaticamente,
            ou insira os preços diretamente.
          </p>

          <div className="flex flex-col gap-4">
            {/* Preço de Compra + Qtd Mínima */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Preço de Compra (R$)"
                id="purchasePrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                {...register('purchasePrice', {
                  min: { value: 0.01, message: 'Deve ser positivo' },
                  onChange: (e) => {
                    const pc = e.target.value;
                    const newA = calcPrice(pc, marginA);
                    const newB = calcPrice(pc, marginB);
                    const newC = calcPrice(pc, marginC);
                    if (newA) setValue('priceA', newA);
                    if (newB) setValue('priceB', newB);
                    if (newC) setValue('priceC', newC);
                  },
                })}
                error={formState.errors.purchasePrice?.message}
              />
              <Input
                label="Qtd. Mínima"
                id="minQuantity"
                type="number"
                min="1"
                step="1"
                {...register('minQuantity', {
                  min: { value: 1, message: 'Mínimo 1' },
                })}
                error={formState.errors.minQuantity?.message}
              />
            </div>

            {/* Tabela de margem × preço */}
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              {/* Header */}
              <div className="grid grid-cols-[120px_1fr] gap-0 border-b border-neutral-200 bg-neutral-50 px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">% Margem</span>
                <span className="pl-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Preço de Venda (R$)</span>
              </div>

              {/* Preço A */}
              <div className="grid grid-cols-[120px_1fr] items-end gap-3 border-b border-neutral-100 px-3 py-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-500">Margem A</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={marginA}
                      onChange={(e) => {
                        setMarginA(e.target.value);
                        const price = calcPrice(watchedPurchasePrice, e.target.value);
                        if (price) setValue('priceA', price);
                      }}
                      className="w-16 rounded-md border border-neutral-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />
                    <span className="text-xs text-neutral-400">%</span>
                  </div>
                </div>
                <Input
                  label="Preço A (atacado) *"
                  id="priceA"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('priceA', {
                    required: 'Preço A é obrigatório',
                    min: { value: 0.01, message: 'Deve ser positivo' },
                    onChange: (e) => {
                      const margin = calcMargin(watchedPurchasePrice, e.target.value);
                      if (margin) setMarginA(margin);
                    },
                  })}
                  error={formState.errors.priceA?.message}
                />
              </div>

              {/* Preço B */}
              <div className="grid grid-cols-[120px_1fr] items-end gap-3 border-b border-neutral-100 px-3 py-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-500">Margem B</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={marginB}
                      onChange={(e) => {
                        setMarginB(e.target.value);
                        const price = calcPrice(watchedPurchasePrice, e.target.value);
                        if (price) setValue('priceB', price);
                      }}
                      className="w-16 rounded-md border border-neutral-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />
                    <span className="text-xs text-neutral-400">%</span>
                  </div>
                </div>
                <Input
                  label="Preço B (intermediário) *"
                  id="priceB"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('priceB', {
                    required: 'Preço B é obrigatório',
                    min: { value: 0.01, message: 'Deve ser positivo' },
                    onChange: (e) => {
                      const margin = calcMargin(watchedPurchasePrice, e.target.value);
                      if (margin) setMarginB(margin);
                    },
                  })}
                  error={formState.errors.priceB?.message}
                />
              </div>

              {/* Preço C */}
              <div className="grid grid-cols-[120px_1fr] items-end gap-3 px-3 py-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-500">Margem C</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={marginC}
                      onChange={(e) => {
                        setMarginC(e.target.value);
                        const price = calcPrice(watchedPurchasePrice, e.target.value);
                        if (price) setValue('priceC', price);
                      }}
                      className="w-16 rounded-md border border-neutral-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />
                    <span className="text-xs text-neutral-400">%</span>
                  </div>
                </div>
                <Input
                  label="Preço C (varejo) *"
                  id="priceC"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('priceC', {
                    required: 'Preço C é obrigatório',
                    min: { value: 0.01, message: 'Deve ser positivo' },
                    onChange: (e) => {
                      const margin = calcMargin(watchedPurchasePrice, e.target.value);
                      if (margin) setMarginC(margin);
                    },
                  })}
                  error={formState.errors.priceC?.message}
                />
              </div>
            </div>

            {/* Price order errors */}
            {priceOrderErrors.length > 0 && (
              <div className="space-y-1">
                {priceOrderErrors.map((err, i) => (
                  <p key={i} className="text-xs text-amber-600">⚠ {err}</p>
                ))}
              </div>
            )}

            {/* Live margin summary */}
            {parseFloat(watchedPurchasePrice) > 0 && (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Margens sobre custo
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'A', margin: marginA },
                    { label: 'B', margin: marginB },
                    { label: 'C', margin: marginC },
                  ].map(({ label, margin }) => {
                    const m = parseFloat(margin);
                    const color = m >= 20 ? 'bg-green-100 text-green-700'
                      : m >= 10 ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700';
                    return (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-xs font-medium text-neutral-600">Tabela {label}</span>
                        {m > 0 ? (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
                            {m.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── Fotos (só na edição) ── */}
        {isEditing && id && (
          <Card>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Fotos do produto
            </h2>
            <ProductPhotoUpload
              productId={id}
              photos={existing?.photos ?? []}
              queryKey={productQueryKey}
            />
          </Card>
        )}

        {/* ── Variações (só na edição) ── */}
        {isEditing && id && (
          <Card>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Variações
            </h2>
            <p className="mb-4 text-xs text-neutral-500">
              Ex: Cor → Azul, Cor → Vermelho, Tamanho → P
            </p>
            <ProductVariationEditor
              productId={id}
              variations={existing?.variations ?? []}
              queryKey={productQueryKey}
            />
          </Card>
        )}

        {/* ── Descontos por Volume (só na edição) ── */}
        {isEditing && id && (
          <Card>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Descontos por Volume
            </h2>
            {discounts.length > 0 && (
              <table className="mb-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-left text-xs text-neutral-500">
                    <th className="pb-2 font-medium">Qtd. mínima</th>
                    <th className="pb-2 font-medium">Desconto</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((d) => (
                    <tr key={d.id} className="border-b border-neutral-50">
                      <td className="py-2">{d.minQuantity} un.</td>
                      <td className="py-2 text-green-700 font-medium">{d.discountPercent}%</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => deleteDiscountMutation.mutate(d.id)}
                          className="text-xs text-danger hover:underline"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-500">Qtd. mínima</label>
                <input
                  type="number"
                  min={1}
                  value={discountMinQty}
                  onChange={(e) => setDiscountMinQty(e.target.value)}
                  placeholder="100"
                  className="w-24 rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-500">Desconto %</label>
                <input
                  type="number"
                  min={0.01}
                  max={100}
                  step={0.01}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="5.00"
                  className="w-24 rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={!discountMinQty || !discountPercent || addDiscountMutation.isPending}
                onClick={() => addDiscountMutation.mutate()}
              >
                Adicionar
              </Button>
            </div>
          </Card>
        )}

        {/* ── Histórico de Preços (só na edição) ── */}
        {isEditing && id && (
          <Card>
            <button
              type="button"
              onClick={() => setShowPriceHistory((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-semibold uppercase tracking-wide text-neutral-500"
            >
              <span>Histórico de Preços</span>
              <span>{showPriceHistory ? '▲' : '▼'}</span>
            </button>
            {showPriceHistory && (
              <div className="mt-4 overflow-x-auto">
                {priceHistory.length === 0 ? (
                  <p className="text-xs text-neutral-400">Nenhuma alteração de preço registrada.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 text-left text-neutral-500">
                        <th className="pb-2 font-medium">Data</th>
                        <th className="pb-2 font-medium">Custo</th>
                        <th className="pb-2 font-medium">Preço A</th>
                        <th className="pb-2 font-medium">Preço B</th>
                        <th className="pb-2 font-medium">Preço C</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceHistory.map((h) => (
                        <tr key={h.id} className="border-b border-neutral-50">
                          <td className="py-1.5 pr-3 whitespace-nowrap">
                            {new Date(h.changedAt).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-1.5 pr-3">
                            <span className="text-neutral-400">{fmtPrice(h.oldPurchasePrice)}</span>
                            {' → '}
                            <span className="font-medium">{fmtPrice(h.newPurchasePrice)}</span>
                          </td>
                          <td className="py-1.5 pr-3">
                            <span className="text-neutral-400">{fmtPrice(h.oldPriceA)}</span>
                            {' → '}
                            <span className="font-medium">{fmtPrice(h.newPriceA)}</span>
                          </td>
                          <td className="py-1.5 pr-3">
                            <span className="text-neutral-400">{fmtPrice(h.oldPriceB)}</span>
                            {' → '}
                            <span className="font-medium">{fmtPrice(h.newPriceB)}</span>
                          </td>
                          <td className="py-1.5">
                            <span className="text-neutral-400">{fmtPrice(h.oldPriceC)}</span>
                            {' → '}
                            <span className="font-medium">{fmtPrice(h.newPriceC)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </Card>
        )}

        {!isEditing && (
          <p className="text-xs text-neutral-500">
            Salve o produto primeiro para adicionar fotos e variações.
          </p>
        )}
      </div>

      {/* ── Preview lateral (desktop) ── */}
      <div className="mt-6 xl:mt-0 xl:w-64 xl:shrink-0">
        <div className="sticky top-6">
          <p className="mb-3 text-sm font-semibold text-neutral-700">
            Preview do card na loja
          </p>
          <ProductCardPreview
            name={watchedName}
            description={watchedDesc}
            priceC={parseFloat(watchedPriceC) || 0}
            categoryName={previewCategory}
            imageUrl={previewImage}
          />
        </div>
      </div>
    </div>
  );
}
