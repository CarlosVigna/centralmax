import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { createCustomer, getCustomer, updateCustomer } from '../../services/customerService';
import { ORIGIN_OPTIONS, STATUS_OPTIONS, PROSPECT_STATUS_OPTIONS } from '../../types/customer';
import type { CustomerRequest, ProspectStatus } from '../../types/customer';

interface CustomerFormValues {
  name: string;
  email: string;
  phone: string;
  document: string;
  status: string;
  origin: string;
  notes: string;
  addressZip: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  contactCadenceDays: string;
  nextContactDate: string;
  cadenceReason: string;
  // CRM
  commercialPotential: string;
  commercialNotes: string;
  businessType: string;
  prospectStatus: string;
  lostReason: string;
}

export function CustomerFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numberInputRef = useRef<HTMLInputElement | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const { data: existing, isLoading: loadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id!),
    enabled: isEditing,
  });

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<CustomerFormValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      document: '',
      status: 'PROSPECT',
      origin: '',
      notes: '',
      addressZip: '',
      addressStreet: '',
      addressNumber: '',
      addressComplement: '',
      addressNeighborhood: '',
      addressCity: 'São José do Rio Preto',
      addressState: 'SP',
      contactCadenceDays: '',
      nextContactDate: '',
      cadenceReason: '',
      commercialPotential: '',
      commercialNotes: '',
      businessType: '',
      prospectStatus: '',
      lostReason: '',
    },
  });

  const cadenceDaysWatched = watch('contactCadenceDays');
  const statusWatched = watch('status');
  const prospectStatusWatched = watch('prospectStatus');
  const potentialWatched = watch('commercialPotential');

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        email: existing.email ?? '',
        phone: existing.phone ?? '',
        document: existing.document ?? '',
        status: existing.status,
        origin: existing.origin,
        notes: existing.notes ?? '',
        addressZip: existing.addressZip ?? '',
        addressStreet: existing.addressStreet ?? '',
        addressNumber: existing.addressNumber ?? '',
        addressComplement: existing.addressComplement ?? '',
        addressNeighborhood: existing.addressNeighborhood ?? '',
        addressCity: existing.addressCity ?? 'São José do Rio Preto',
        addressState: existing.addressState ?? 'SP',
        contactCadenceDays: existing.contactCadenceDays != null ? String(existing.contactCadenceDays) : '',
        nextContactDate: existing.nextContactDate ?? '',
        cadenceReason: '',
        commercialPotential: existing.commercialPotential != null ? String(existing.commercialPotential) : '',
        commercialNotes: existing.commercialNotes ?? '',
        businessType: existing.businessType ?? '',
        prospectStatus: existing.prospectStatus ?? '',
        lostReason: existing.lostReason ?? '',
      });
    }
  }, [existing, reset]);

  async function fetchCep() {
    const cep = watch('addressZip').replace(/\D/g, '');
    if (cep.length !== 8) {
      setCepError('CEP deve ter 8 dígitos.');
      return;
    }
    setCepError('');
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError('CEP não encontrado.');
        return;
      }
      setValue('addressStreet', data.logradouro ?? '');
      setValue('addressNeighborhood', data.bairro ?? '');
      setValue('addressCity', data.localidade ?? '');
      setValue('addressState', data.uf ?? '');
      setTimeout(() => numberInputRef.current?.focus(), 50);
    } catch {
      setCepError('Erro ao consultar CEP.');
    } finally {
      setCepLoading(false);
    }
  }

  const saveMutation = useMutation({
    mutationFn: (request: CustomerRequest) =>
      isEditing ? updateCustomer(id!, request) : createCustomer(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (id) queryClient.invalidateQueries({ queryKey: ['customer', id] });
      navigate('/admin/clientes');
    },
  });

  function onSubmit(values: CustomerFormValues) {
    const request: CustomerRequest = {
      name: values.name.trim(),
      email: values.email.trim() || undefined,
      phone: values.phone.trim() || undefined,
      document: values.document.trim() || undefined,
      status: values.status as CustomerRequest['status'],
      origin: values.origin as CustomerRequest['origin'],
      notes: values.notes.trim() || undefined,
      addressZip: values.addressZip.trim() || undefined,
      addressStreet: values.addressStreet.trim() || undefined,
      addressNumber: values.addressNumber.trim() || undefined,
      addressComplement: values.addressComplement.trim() || undefined,
      addressNeighborhood: values.addressNeighborhood.trim() || undefined,
      addressCity: values.addressCity.trim() || undefined,
      addressState: values.addressState.trim() || undefined,
      contactCadenceDays: values.contactCadenceDays ? Number(values.contactCadenceDays) : undefined,
      nextContactDate: values.nextContactDate || undefined,
      cadenceReason: values.cadenceReason.trim() || undefined,
      commercialPotential: values.commercialPotential ? Number(values.commercialPotential) : undefined,
      commercialNotes: values.commercialNotes.trim() || undefined,
      businessType: values.businessType.trim() || undefined,
      prospectStatus: values.prospectStatus ? values.prospectStatus as ProspectStatus : undefined,
      lostReason: values.lostReason.trim() || undefined,
    };
    saveMutation.mutate(request);
  }

  const originSelectOptions = [
    { value: '', label: 'Selecione a origem...' },
    ...ORIGIN_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
  ];

  const statusSelectOptions = STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }));

  const { ref: numberFormRef, ...numberRestProps } = register('addressNumber', {
    maxLength: { value: 20, message: 'Máximo 20 caracteres' },
  });

  if (isEditing && loadingCustomer) {
    return <p className="text-sm text-neutral-600">Carregando cliente...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">
        {isEditing ? 'Editar cliente' : 'Novo cliente'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label="Nome *"
          id="name"
          {...register('name', {
            required: 'Nome é obrigatório',
            minLength: { value: 2, message: 'Mínimo 2 caracteres' },
            maxLength: { value: 160, message: 'Máximo 160 caracteres' },
          })}
          error={formState.errors.name?.message}
        />

        <Input
          label="E-mail"
          id="email"
          type="email"
          placeholder="email@exemplo.com"
          {...register('email', {
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' },
          })}
          error={formState.errors.email?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Telefone"
            id="phone"
            placeholder="(17) 99999-9999"
            {...register('phone', {
              maxLength: { value: 20, message: 'Máximo 20 caracteres' },
            })}
            error={formState.errors.phone?.message}
          />
          <Input
            label="CPF / CNPJ"
            id="document"
            placeholder="000.000.000-00"
            {...register('document', {
              maxLength: { value: 20, message: 'Máximo 20 caracteres' },
            })}
            error={formState.errors.document?.message}
          />
        </div>

        <Select
          label="Tipo"
          id="status"
          options={statusSelectOptions}
          {...register('status')}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="origin" className="text-sm font-medium text-neutral-900">
            Origem {!isEditing && '*'}
          </label>
          <select
            id="origin"
            disabled={isEditing}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
            {...register('origin', {
              validate: (v) => isEditing || Boolean(v) || 'Origem é obrigatória',
            })}
          >
            {originSelectOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {!isEditing && formState.errors.origin && (
            <p className="text-xs text-danger">{formState.errors.origin.message}</p>
          )}
          {isEditing && (
            <p className="text-xs text-neutral-500">A origem não pode ser alterada após o cadastro.</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-medium text-neutral-900">
            Observações
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Observações internas sobre o cliente..."
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
            {...register('notes', {
              maxLength: { value: 2000, message: 'Máximo 2000 caracteres' },
            })}
          />
          {formState.errors.notes && (
            <p className="text-xs text-danger">{formState.errors.notes.message}</p>
          )}
        </div>

        {/* ── Endereço ── */}
        <div className="rounded-lg border border-neutral-200 p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Endereço
          </h2>

          <div className="flex items-end gap-2 mb-4">
            <div className="flex-1">
              <Input
                label="CEP"
                id="addressZip"
                placeholder="00000-000"
                {...register('addressZip', {
                  maxLength: { value: 10, message: 'Máximo 10 caracteres' },
                })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchCep(); } }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={cepLoading}
              onClick={fetchCep}
              className="mb-0.5"
            >
              {cepLoading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
          {cepError && <p className="mb-3 text-xs text-danger">{cepError}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
            <div className="sm:col-span-2">
              <Input
                label="Rua / Logradouro"
                id="addressStreet"
                placeholder="Rua das Flores"
                {...register('addressStreet', {
                  maxLength: { value: 255, message: 'Máximo 255 caracteres' },
                })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-900">Número</label>
              <input
                id="addressNumber"
                placeholder="123"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                ref={(el) => {
                  numberFormRef(el);
                  numberInputRef.current = el;
                }}
                {...numberRestProps}
              />
              {formState.errors.addressNumber && (
                <p className="mt-1 text-xs text-danger">{formState.errors.addressNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Input
              label="Complemento"
              id="addressComplement"
              placeholder="Apto 1, Bloco B..."
              {...register('addressComplement', {
                maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              })}
            />
            <Input
              label="Bairro"
              id="addressNeighborhood"
              placeholder="Centro"
              {...register('addressNeighborhood', {
                maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input
                label="Cidade"
                id="addressCity"
                placeholder="São José do Rio Preto"
                {...register('addressCity', {
                  maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                })}
              />
            </div>
            <div>
              <Input
                label="Estado"
                id="addressState"
                placeholder="SP"
                {...register('addressState', {
                  maxLength: { value: 2, message: 'Máximo 2 caracteres' },
                })}
              />
            </div>
          </div>
        </div>

        {/* ── Cadência de Contato ── */}
        <div className="rounded-lg border border-neutral-200 p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Cadência de Contato
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-900">
                Intervalo entre contatos (dias)
              </label>
              <input
                type="number"
                min={1}
                placeholder="Ex: 7"
                {...register('contactCadenceDays', {
                  min: { value: 1, message: 'Mínimo 1 dia' },
                })}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              <p className="mt-1 text-xs text-neutral-400">7 = semanal, 15 = quinzenal, 30 = mensal</p>
              {formState.errors.contactCadenceDays && (
                <p className="mt-1 text-xs text-danger">{formState.errors.contactCadenceDays.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-900">
                Próximo contato
              </label>
              <input
                type="date"
                {...register('nextContactDate')}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              {!cadenceDaysWatched && (
                <p className="mt-1 text-xs text-neutral-400">Para prospects sem cadência fixa</p>
              )}
            </div>
            <div className="sm:col-span-1">
              <Input
                label="Motivo do próximo contato"
                id="cadenceReason"
                placeholder="Ex: Pedido semanal, Retorno prospect"
                {...register('cadenceReason', {
                  maxLength: { value: 255, message: 'Máximo 255 caracteres' },
                })}
              />
            </div>
          </div>
        </div>

        {/* ── Perfil Comercial ── */}
        <div className="rounded-lg border border-neutral-200 p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Perfil Comercial
          </h2>

          {/* Potencial — star rating */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Potencial comercial
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('commercialPotential', potentialWatched === String(star) ? '' : String(star))}
                  className={`text-2xl leading-none transition ${
                    Number(potentialWatched) >= star ? 'text-amber-400' : 'text-neutral-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <input type="hidden" {...register('commercialPotential')} />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Tipo de negócio
            </label>
            <input
              type="text"
              list="businessTypeList"
              placeholder="Ex: Papelaria, Gráfica, Supermercado..."
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              {...register('businessType', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })}
            />
            <datalist id="businessTypeList">
              <option value="Papelaria" />
              <option value="Gráfica" />
              <option value="Supermercado" />
              <option value="Padaria" />
              <option value="Distribuidora" />
              <option value="Atacado" />
              <option value="E-commerce" />
              <option value="Farmácia" />
            </datalist>
          </div>

          {statusWatched === 'PROSPECT' && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-neutral-900">
                Status do prospect
              </label>
              <select
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                {...register('prospectStatus')}
              >
                <option value="">Selecione...</option>
                {PROSPECT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          {prospectStatusWatched === 'PERDIDO' && (
            <div className="mb-4">
              <Input
                label="Motivo da perda"
                id="lostReason"
                placeholder="Por que o prospect foi perdido?"
                {...register('lostReason', { maxLength: { value: 255, message: 'Máximo 255 caracteres' } })}
                error={formState.errors.lostReason?.message}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Notas comerciais
            </label>
            <textarea
              rows={3}
              placeholder="Produtos de interesse, objeções, perfil de compra..."
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              {...register('commercialNotes', { maxLength: { value: 2000, message: 'Máximo 2000 caracteres' } })}
            />
          </div>
        </div>

        {saveMutation.isError && (
          <p className="text-sm text-danger">
            {axios.isAxiosError(saveMutation.error)
              ? (saveMutation.error.response?.data?.message ?? 'Erro ao salvar. Tente novamente.')
              : 'Erro ao salvar. Tente novamente.'}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={formState.isSubmitting || saveMutation.isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar cliente'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/clientes')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
