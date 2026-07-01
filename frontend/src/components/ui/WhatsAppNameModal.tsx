import { useEffect, useRef, useState } from 'react';

interface WhatsAppNameModalProps {
  open: boolean;
  /** Nome já salvo (pré-preenche o campo) */
  initialName?: string | null;
  onConfirm: (name: string | null, remember: boolean) => void;
}

export function WhatsAppNameModal({ open, initialName, onConfirm }: WhatsAppNameModalProps) {
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync initialName when modal opens
  useEffect(() => {
    if (open) {
      setName(initialName ?? '');
      setRemember(!!initialName);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initialName]);

  // ESC to close (skip)
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onConfirm(null, false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onConfirm]);

  if (!open) return null;

  const trimmed = name.trim();
  const canSubmit = trimmed.length >= 2;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm(trimmed, remember);
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === overlayRef.current && onConfirm(null, false)}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-bold text-neutral-900">Quase lá! 😊</h2>
        <p className="mb-5 text-sm text-neutral-600">Como podemos te chamar?</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="wpp-name" className="sr-only">
              Seu nome
            </label>
            <input
              id="wpp-name"
              ref={inputRef}
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {name.length > 0 && name.trim().length < 2 && (
              <p className="mt-1 text-xs text-red-500">Mínimo 2 caracteres</p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-secondary"
            />
            Lembrar meu nome neste dispositivo
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-md bg-secondary py-3 text-sm font-semibold text-white
              transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuar para o WhatsApp
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => onConfirm(null, false)}
            className="text-xs text-neutral-400 underline hover:text-neutral-600 transition"
          >
            Pular
          </button>
        </div>
      </div>
    </div>
  );
}
