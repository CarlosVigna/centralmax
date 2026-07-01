import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { addVariation, removeVariation } from '../../services/productVariationService';
import type { ProductVariation } from '../../types/product';

interface Props {
  productId: string;
  variations: ProductVariation[];
  queryKey: unknown[];
}

export function ProductVariationEditor({ productId, variations, queryKey }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  function invalidate() {
    queryClient.invalidateQueries({ queryKey });
  }

  const addMutation = useMutation({
    mutationFn: () => addVariation(productId, { name: name.trim(), value: value.trim() }),
    onSuccess: () => {
      invalidate();
      setName('');
      setValue('');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (variationId: string) => removeVariation(productId, variationId),
    onSuccess: invalidate,
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !value.trim()) return;
    addMutation.mutate();
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div className="w-36">
          <Input
            label="Nome"
            placeholder="ex: Cor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </div>
        <div className="w-48">
          <Input
            label="Valor"
            placeholder="ex: Azul"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={100}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={!name.trim() || !value.trim() || addMutation.isPending}
        >
          Adicionar
        </Button>
      </form>

      {/* Variation chips */}
      {variations.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {variations.map((v) => (
            <span
              key={v.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-800"
            >
              <span className="font-medium text-neutral-500">{v.name}:</span>
              {v.value}
              <button
                type="button"
                onClick={() => removeMutation.mutate(v.id)}
                disabled={removeMutation.isPending}
                className="ml-0.5 text-neutral-400 hover:text-danger transition-colors"
                title="Remover variação"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Nenhuma variação cadastrada.</p>
      )}
    </div>
  );
}
