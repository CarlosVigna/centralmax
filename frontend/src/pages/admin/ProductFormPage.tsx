import axios from 'axios';
import { useEffect } from 'react';
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
import { createProduct, getAdminProduct, updateProduct } from '../../services/productService';
import type { ProductRequest } from '../../types/product';

interface ProductFormValues {
  name: string;
  description: string;
  categoryId: string;
  supplierId: string;
  priceA: string;
  priceB: string;
  priceC: string;
  mainImageUrl: string;
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const productQueryKey = ['admin-product', id];

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

  const { register, handleSubmit, reset, control, formState } = useForm<ProductFormValues>({
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      supplierId: '',
      priceA: '',
      priceB: '',
      priceC: '',
      mainImageUrl: '',
    },
  });

  // Watch fields for live preview and price validation
  const watchedName = useWatch({ control, name: 'name' });
  const watchedDesc = useWatch({ control, name: 'description' });
  const watchedPriceA = useWatch({ control, name: 'priceA' });
  const watchedPriceB = useWatch({ control, name: 'priceB' });
  const watchedPriceC = useWatch({ control, name: 'priceC' });
  const watchedCategoryId = useWatch({ control, name: 'categoryId' });
  const watchedImageUrl = useWatch({ control, name: 'mainImageUrl' });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description ?? '',
        categoryId: existing.categoryId,
        supplierId: existing.supplierId ?? '',
        priceA: String(existing.priceA),
        priceB: String(existing.priceB),
        priceC: String(existing.priceC),
        mainImageUrl: existing.mainImageUrl ?? '',
      });
    }
  }, [existing, reset]);

  const saveMutation = useMutation({
    mutationFn: (request: ProductRequest) =>
      isEditing ? updateProduct(id!, request) : createProduct(request),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (!isEditing) {
        // Redirect to edit page so photo/variation sections become available
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

  const previewCategory =
    categories.find((c) => c.id === watchedCategoryId)?.name ?? '';

  // For preview image: prefer first uploaded photo, fall back to mainImageUrl field
  const previewImage =
    (isEditing && existing?.photos?.[0]?.url) ||
    watchedImageUrl ||
    null;

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

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Preço A (atacado) *"
                id="priceA"
                type="number"
                step="0.01"
                min="0.01"
                {...register('priceA', {
                  required: 'Preço A é obrigatório',
                  min: { value: 0.01, message: 'Deve ser positivo' },
                })}
                error={formState.errors.priceA?.message}
              />
              <Input
                label="Preço B (interm.) *"
                id="priceB"
                type="number"
                step="0.01"
                min="0.01"
                {...register('priceB', {
                  required: 'Preço B é obrigatório',
                  min: { value: 0.01, message: 'Deve ser positivo' },
                })}
                error={formState.errors.priceB?.message}
              />
              <Input
                label="Preço C (varejo) *"
                id="priceC"
                type="number"
                step="0.01"
                min="0.01"
                {...register('priceC', {
                  required: 'Preço C é obrigatório',
                  min: { value: 0.01, message: 'Deve ser positivo' },
                })}
                error={formState.errors.priceC?.message}
              />
            </div>
            {/* Real-time price order validation */}
            {(() => {
              const a = parseFloat(watchedPriceA);
              const b = parseFloat(watchedPriceB);
              const c = parseFloat(watchedPriceC);
              const errs: string[] = [];
              if (!isNaN(a) && !isNaN(b) && a > 0 && b > 0 && b < a)
                errs.push('Preço B (intermediário) deve ser ≥ Preço A (atacado)');
              if (!isNaN(b) && !isNaN(c) && b > 0 && c > 0 && c < b)
                errs.push('Preço C (varejo) deve ser ≥ Preço B (intermediário)');
              return errs.length > 0 ? (
                <div className="space-y-1">
                  {errs.map((err, i) => (
                    <p key={i} className="text-xs text-amber-600">⚠ {err}</p>
                  ))}
                </div>
              ) : null;
            })()}

            <Input
              label="URL da imagem (legado)"
              id="mainImageUrl"
              type="url"
              placeholder="https://... (use upload de foto abaixo)"
              {...register('mainImageUrl', {
                maxLength: { value: 500, message: 'Máximo 500 caracteres' },
              })}
              error={formState.errors.mainImageUrl?.message}
              helperText="Opcional — preferira fazer upload de fotos abaixo"
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
