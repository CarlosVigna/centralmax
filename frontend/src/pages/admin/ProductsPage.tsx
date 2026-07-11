import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { listAdminProducts, deleteProduct, duplicateProduct, activateProduct } from '../../services/productService';
import { listAllCategories } from '../../services/categoryService';
import { formatCurrency } from '../../utils/formatCurrency';
import type { ProductAdmin } from '../../types/product';
import { Pagination } from '../../components/ui/Pagination';

export function ProductsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ATIVO' | 'INATIVO' | ''>('ATIVO');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [confirmDelete, setConfirmDelete] = useState<ProductAdmin | null>(null);
  const [confirmDuplicate, setConfirmDuplicate] = useState<ProductAdmin | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: listAllCategories,
    staleTime: 1000 * 60 * 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { search, status: statusFilter || undefined, categoryId: categoryId || undefined, page, size: pageSize }],
    queryFn: () =>
      listAdminProducts({
        search: search || undefined,
        status: statusFilter || undefined,
        categoryId: categoryId || undefined,
        page,
        size: pageSize,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setConfirmDelete(null);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ id, copyPhotos }: { id: string; copyPhotos: boolean }) =>
      duplicateProduct(id, copyPhotos),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setConfirmDuplicate(null);
      navigate(`/admin/produtos/${created.id}/editar`);
    },
  });

  const products = data?.content ?? [];

  const columns = [
    {
      header: 'Nome',
      render: (row: ProductAdmin) => (
        <span className="font-medium text-neutral-900">{row.name}</span>
      ),
    },
    {
      header: 'Categoria',
      render: (row: ProductAdmin) => (
        <span className="text-neutral-700">{row.categoryName}</span>
      ),
    },
    {
      header: 'Preço A',
      render: (row: ProductAdmin) => (
        <span className="text-neutral-700">{formatCurrency(row.priceA)}</span>
      ),
    },
    {
      header: 'Preço B',
      render: (row: ProductAdmin) => (
        <span className="text-neutral-700">{formatCurrency(row.priceB)}</span>
      ),
    },
    {
      header: 'Preço C',
      render: (row: ProductAdmin) => (
        <span className="text-neutral-700">{formatCurrency(row.priceC)}</span>
      ),
    },
    {
      header: 'Fotos',
      render: (row: ProductAdmin) => (
        <span className="text-neutral-600">{row.photos?.length ?? 0}</span>
      ),
    },
    {
      header: 'Status',
      render: (row: ProductAdmin) =>
        row.status === 'ATIVO' ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="neutral">Inativo</Badge>
        ),
    },
    {
      header: 'Ações',
      render: (row: ProductAdmin) => (
        <div className="flex flex-wrap gap-1.5">
          <Link to={`/admin/produtos/${row.id}/editar`}>
            <Button size="sm" variant="outline">
              Editar
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            title="Duplicar produto"
            onClick={() => setConfirmDuplicate(row)}
          >
            Copiar
          </Button>
          {row.status === 'ATIVO' ? (
            <Button size="sm" variant="danger" onClick={() => setConfirmDelete(row)}>
              Desativar
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              disabled={activateMutation.isPending}
              onClick={() => activateMutation.mutate(row.id)}
            >
              Reativar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Produtos</h1>
        <Link to="/admin/produtos/novo">
          <Button>Novo produto</Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="max-w-xs"
        />
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as 'ATIVO' | 'INATIVO' | ''); setPage(0); }}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          <option value="ATIVO">Apenas ativos</option>
          <option value="INATIVO">Apenas inativos</option>
          <option value="">Todos</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Carregando...</p>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="space-y-2 md:hidden">
            {products.length === 0 ? (
              <p className="text-sm text-neutral-400">Nenhum produto encontrado.</p>
            ) : products.map((p) => (
              <div key={p.id} className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{p.name}</p>
                    <p className="text-xs text-neutral-500">{p.categoryName}</p>
                  </div>
                  {p.status === 'ATIVO' ? (
                    <Badge variant="success">Ativo</Badge>
                  ) : (
                    <Badge variant="neutral">Inativo</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-600">
                  A: {formatCurrency(p.priceA)} &middot; B: {formatCurrency(p.priceB)} &middot; C: {formatCurrency(p.priceC)}
                </p>
                <div className="mt-2 flex gap-1.5">
                  <Link to={`/admin/produtos/${p.id}/editar`}>
                    <Button size="sm" variant="outline">Editar</Button>
                  </Link>
                  {p.status === 'ATIVO' ? (
                    <Button size="sm" variant="danger" onClick={() => setConfirmDelete(p)}>Desativar</Button>
                  ) : (
                    <Button size="sm" variant="ghost" disabled={activateMutation.isPending}
                      onClick={() => activateMutation.mutate(p.id)}>Reativar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-neutral-300 bg-white md:block">
            <Table
              columns={columns}
              data={products}
              emptyMessage="Nenhum produto encontrado."
            />
          </div>
          {data && (
            <Pagination
              page={page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              size={pageSize}
              onPageChange={setPage}
              onSizeChange={(s) => { setPageSize(s); setPage(0); }}
            />
          )}
        </>
      )}

      {/* FAB mobile */}
      <Link
        to="/admin/produtos/novo"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-primary text-white shadow-lg transition hover:bg-primary/90 md:hidden"
        aria-label="Novo produto"
      >
        <span className="text-2xl leading-none">+</span>
      </Link>

      {/* Modal: desativar */}
      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Desativar produto"
      >
        <p className="mb-4 text-sm text-neutral-700">
          Deseja desativar o produto <strong>{confirmDelete?.name}</strong>? Ele não aparecerá mais no catálogo público.
        </p>
        {deleteMutation.isError && (
          <p className="mb-4 text-sm text-danger">
            {axios.isAxiosError(deleteMutation.error)
              ? (deleteMutation.error.response?.data?.message ?? 'Erro ao desativar.')
              : 'Erro ao desativar.'}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
          >
            Desativar
          </Button>
        </div>
      </Modal>

      {/* Modal: duplicar */}
      <Modal
        open={Boolean(confirmDuplicate)}
        onClose={() => setConfirmDuplicate(null)}
        title="Duplicar produto"
      >
        <p className="mb-5 text-sm text-neutral-700">
          Deseja duplicar <strong>{confirmDuplicate?.name}</strong>?
          O produto será criado como <em>inativo</em> com o nome "Cópia de ...".
          <br />
          <br />
          Deseja copiar as fotos também?
        </p>
        {duplicateMutation.isError && (
          <p className="mb-4 text-sm text-danger">
            {axios.isAxiosError(duplicateMutation.error)
              ? (duplicateMutation.error.response?.data?.message ?? 'Erro ao duplicar.')
              : 'Erro ao duplicar.'}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDuplicate(null)}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            disabled={duplicateMutation.isPending}
            onClick={() =>
              confirmDuplicate &&
              duplicateMutation.mutate({ id: confirmDuplicate.id, copyPhotos: false })
            }
          >
            Não, só o produto
          </Button>
          <Button
            disabled={duplicateMutation.isPending}
            onClick={() =>
              confirmDuplicate &&
              duplicateMutation.mutate({ id: confirmDuplicate.id, copyPhotos: true })
            }
          >
            Sim, copiar fotos
          </Button>
        </div>
      </Modal>
    </div>
  );
}
