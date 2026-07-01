import { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { useCustomerName } from '../../hooks/useCustomerName';
import { formatCurrency } from '../../utils/formatCurrency';
import { buildCartWhatsAppUrl } from '../../utils/whatsapp';
import { WhatsAppNameModal } from '../ui/WhatsAppNameModal';
import { Button } from '../ui/Button';

export function CartSummary() {
  const { items, total, itemCount, clearCart } = useCart();
  const { name: savedName, saveName } = useCustomerName();
  const [confirming, setConfirming] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);

  // Pedido quando todos têm preço; orçamento se qualquer um não tem
  const isOrder = items.length > 0 && items.every((i) => i.unitPrice > 0);

  function openWhatsApp(customerName: string | null) {
    const url = buildCartWhatsAppUrl(items, customerName, isOrder);
    window.open(url, '_blank');
    setConfirming(true);
  }

  function handleSend() {
    if (savedName) {
      openWhatsApp(savedName);
    } else {
      setShowNameModal(true);
    }
  }

  function handleNameConfirm(name: string | null, remember: boolean) {
    if (name && remember) saveName(name);
    setShowNameModal(false);
    openWhatsApp(name);
  }

  function handleConfirmSent() {
    clearCart();
    setConfirming(false);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-neutral-300 pt-4">
      <div className="flex justify-between text-sm text-neutral-600">
        <span>{itemCount} item(ns)</span>
        <span className="text-lg font-bold text-primary">Total: {formatCurrency(total)}</span>
      </div>

      {/* Nome salvo */}
      {savedName && (
        <p className="text-xs text-neutral-500">
          Enviando como{' '}
          <span className="font-medium text-neutral-700">{savedName}</span>
          {' · '}
          <button
            onClick={() => setShowNameModal(true)}
            className="text-secondary underline hover:opacity-80 transition"
          >
            Alterar
          </button>
        </p>
      )}

      <button
        disabled={itemCount === 0}
        onClick={handleSend}
        className={`w-full rounded-md py-3 text-sm font-semibold text-white transition
          disabled:cursor-not-allowed disabled:opacity-50
          ${isOrder ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isOrder ? 'Fazer Pedido via WhatsApp' : 'Solicitar Orçamento via WhatsApp'}
      </button>

      {confirming && (
        <div className="rounded-md border border-neutral-300 bg-neutral-100 p-3 text-sm">
          <p className="mb-2">Você enviou a mensagem pelo WhatsApp?</p>
          <Button size="sm" onClick={handleConfirmSent}>
            Sim, enviei
          </Button>
        </div>
      )}

      <WhatsAppNameModal
        open={showNameModal}
        initialName={savedName}
        onConfirm={handleNameConfirm}
      />
    </div>
  );
}
