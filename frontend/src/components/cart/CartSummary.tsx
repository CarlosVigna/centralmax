import { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';
import { buildWhatsAppMessage } from '../../utils/buildWhatsAppMessage';
import { Button } from '../ui/Button';

export function CartSummary() {
  const { items, total, itemCount, clearCart } = useCart();
  const [confirming, setConfirming] = useState(false);

  function handleSend() {
    const url = buildWhatsAppMessage(items);
    window.open(url, '_blank');
    setConfirming(true);
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

      <Button disabled={itemCount === 0} onClick={handleSend}>
        Solicitar Orçamento via WhatsApp
      </Button>

      {confirming && (
        <div className="rounded-md border border-neutral-300 bg-neutral-100 p-3 text-sm">
          <p className="mb-2">Você enviou a mensagem pelo WhatsApp?</p>
          <Button size="sm" onClick={handleConfirmSent}>
            Sim, enviei
          </Button>
        </div>
      )}
    </div>
  );
}
