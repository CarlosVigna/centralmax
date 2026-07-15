import axios from 'axios';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  changeUserPassword,
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  type ChangePasswordRequest,
  type UserRequest,
  type UserResponse,
  type UserRole,
} from '../../services/userService';

interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  commissionPriceA: string;
  commissionPriceB: string;
  commissionPriceC: string;
  territory: string;
}

export function UsersPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [pwdModal, setPwdModal] = useState<UserResponse | null>(null);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<UserResponse | null>(null);

  const [activeFilter, setActiveFilter] = useState<'active' | 'inactive' | 'all'>('active');

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: listUsers,
  });

  const filtered = data.filter((u) => {
    if (activeFilter === 'active') return u.active;
    if (activeFilter === 'inactive') return !u.active;
    return true;
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState,
    unregister,
  } = useForm<UserFormValues>({ defaultValues: { role: 'VENDEDOR' } });

  const watchedRole = watch('role');

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: pwdFormState,
  } = useForm<ChangePasswordRequest>();

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-users'] });

  const saveMutation = useMutation({
    mutationFn: ({ id, req }: { id?: string; req: UserRequest }) =>
      id ? updateUser(id, req) : createUser(req),
    onSuccess: () => { invalidate(); closeModal(); },
  });

  const pwdMutation = useMutation({
    mutationFn: ({ id, req }: { id: string; req: ChangePasswordRequest }) =>
      changeUserPassword(id, req),
    onSuccess: () => { setPwdModal(null); resetPwd(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => { invalidate(); setConfirmDeactivate(null); },
  });

  function openCreate() {
    setEditing(null);
    reset({ name: '', email: '', password: '', role: 'VENDEDOR' });
    setModalOpen(true);
  }

  function openEdit(u: UserResponse) {
    setEditing(u);
    // Limpa o registro do campo password — ele fica registrado com required:true
    // da sessão de criação mesmo após o modal fechar (shouldUnregister=false padrão),
    // bloqueando o handleSubmit silenciosamente no modo edição.
    unregister('password');
    reset({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      commissionPriceA: u.commissionPriceA?.toString() ?? '',
      commissionPriceB: u.commissionPriceB?.toString() ?? '',
      commissionPriceC: u.commissionPriceC?.toString() ?? '',
      territory: u.territory ?? '',
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    reset();
  }

  function onSubmit(values: UserFormValues) {
    const req: UserRequest = {
      name: values.name,
      email: values.email,
      role: values.role,
      password: values.password || undefined,
      commissionPriceA: values.commissionPriceA ? parseFloat(values.commissionPriceA) : null,
      commissionPriceB: values.commissionPriceB ? parseFloat(values.commissionPriceB) : null,
      commissionPriceC: values.commissionPriceC ? parseFloat(values.commissionPriceC) : null,
      territory: values.territory || null,
    };
    saveMutation.mutate({ id: editing?.id, req });
  }

  const columns = [
    {
      header: 'Nome',
      render: (row: UserResponse) => (
        <span className="font-medium text-neutral-900">{row.name}</span>
      ),
    },
    {
      header: 'Email',
      render: (row: UserResponse) => (
        <span className="text-neutral-700">{row.email}</span>
      ),
    },
    {
      header: 'Role',
      render: (row: UserResponse) => (
        <div className="flex flex-col gap-1">
          <Badge variant={row.role === 'ADMIN' ? 'purple' : 'info'}>
            {row.role}
          </Badge>
          {row.territory && (
            <span className="text-xs text-neutral-400 truncate max-w-[120px]">{row.territory}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row: UserResponse) =>
        row.active ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="neutral">Inativo</Badge>
        ),
    },
    {
      header: 'Ações',
      render: (row: UserResponse) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setPwdModal(row)}>
            Redefinir senha
          </Button>
          {row.active && (
            <Button size="sm" variant="danger" onClick={() => setConfirmDeactivate(row)}>
              Desativar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Usuários</h1>
        <Button onClick={openCreate}>Novo usuário</Button>
      </div>

      <div className="mb-4">
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as 'active' | 'inactive' | 'all')}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          <option value="active">Apenas ativos</option>
          <option value="inactive">Apenas inativos</option>
          <option value="all">Todos</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Carregando...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
          <Table columns={columns} data={filtered} emptyMessage="Nenhum usuário cadastrado." />
        </div>
      )}

      {/* Modal criar / editar */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar usuário' : 'Novo usuário'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nome *"
            id="user-name"
            {...register('name', { required: 'Nome é obrigatório' })}
            error={formState.errors.name?.message}
          />
          <Input
            label="Email *"
            id="user-email"
            type="email"
            {...register('email', { required: 'Email é obrigatório' })}
            error={formState.errors.email?.message}
          />
          {!editing && (
            <Input
              label="Senha *"
              id="user-password"
              type="password"
              {...register('password', {
                required: !editing ? 'Senha é obrigatória' : false,
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
              error={formState.errors.password?.message}
            />
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Role *
            </label>
            <select
              {...register('role', { required: true })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              <option value="VENDEDOR">VENDEDOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {watchedRole === 'VENDEDOR' && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Configurações do Vendedor
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Comissão Tipo A (%)"
                  id="commission-a"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="ex: 5.00"
                  {...register('commissionPriceA')}
                />
                <Input
                  label="Comissão Tipo B (%)"
                  id="commission-b"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="ex: 4.00"
                  {...register('commissionPriceB')}
                />
                <Input
                  label="Comissão Tipo C (%)"
                  id="commission-c"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="ex: 3.00"
                  {...register('commissionPriceC')}
                />
              </div>
              <div className="mt-3">
                <Input
                  label="Território (bairros/regiões, vírgula separada)"
                  id="territory"
                  placeholder="ex: Centro, Jardim América, Vila Nova"
                  {...register('territory')}
                />
              </div>
            </div>
          )}

          {saveMutation.isError && (
            <p className="text-sm text-danger">
              {axios.isAxiosError(saveMutation.error)
                ? (saveMutation.error.response?.data?.message ?? 'Erro ao salvar.')
                : 'Erro ao salvar.'}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={formState.isSubmitting || saveMutation.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal redefinir senha */}
      <Modal
        open={Boolean(pwdModal)}
        onClose={() => { setPwdModal(null); resetPwd(); }}
        title="Redefinir senha"
      >
        <p className="mb-4 text-sm text-neutral-600">
          Definir nova senha para <strong>{pwdModal?.name}</strong>.
        </p>
        <form
          onSubmit={handlePwd((values) =>
            pwdModal && pwdMutation.mutate({ id: pwdModal.id, req: values })
          )}
          className="flex flex-col gap-4"
        >
          <Input
            label="Nova senha *"
            id="new-password"
            type="password"
            {...regPwd('password', {
              required: 'Senha é obrigatória',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
            error={pwdFormState.errors.password?.message}
          />
          {pwdMutation.isError && (
            <p className="text-sm text-danger">Erro ao redefinir senha.</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setPwdModal(null); resetPwd(); }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pwdMutation.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal desativar */}
      <Modal
        open={Boolean(confirmDeactivate)}
        onClose={() => setConfirmDeactivate(null)}
        title="Desativar usuário"
      >
        <p className="mb-4 text-sm text-neutral-700">
          Deseja desativar o usuário <strong>{confirmDeactivate?.name}</strong>?
          Ele perderá acesso ao sistema.
        </p>
        {deleteMutation.isError && (
          <p className="mb-4 text-sm text-danger">
            {axios.isAxiosError(deleteMutation.error)
              ? (deleteMutation.error.response?.data?.message ?? 'Erro ao desativar.')
              : 'Erro ao desativar.'}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDeactivate(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => confirmDeactivate && deleteMutation.mutate(confirmDeactivate.id)}
          >
            Desativar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
