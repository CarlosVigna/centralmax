import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
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
    queryKey: ['admin-product', id],
    queryFn: () => getAdminProduct(id!),
    enabled: isEditing,
  });

  const { register, handleSubmit, reset, formState } = useForm<ProductFormValues>({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/produtos');
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

  if (isEditing && loadingProduct) {
    return <p className="text-sm text-neutral-600">Carregando produto...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">
        {isEditing ? 'Editar produto' : 'Novo produto'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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

        <Input
          label="URL da imagem"
          id="mainImageUrl"
          type="url"
          placeholder="https://..."
          {...register('mainImageUrl', {
            maxLength: { value: 500, message: 'Máximo 500 caracteres' },
          })}
          error={formState.errors.mainImageUrl?.message}
        />

        {saveMutation.isError && (
          <p className="text-sm text-danger">
            {axios.isAxiosError(saveMutation.error)
              ? (saveMutation.error.response?.data?.message ?? 'Erro ao salvar. Tente novamente.')
              : 'Erro ao salvar. Tente novamente.'}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={formState.isSubmitting || saveMutation.isPending}>
            {isEditing ? 'Salvar alterações' : 'Criar produto'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/produtos')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
