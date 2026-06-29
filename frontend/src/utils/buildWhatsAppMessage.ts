import type { CartItem } from '../contexts/CartContext';
import { formatCurrency } from './formatCurrency';

export function buildWhatsAppMessage(items: CartItem[]): string {
  const lines = items.map((item) => {
    const subtotal = item.quantity * item.unitPrice;
    return `📦 *${item.name}* x${item.quantity} — ${formatCurrency(subtotal)}`;
  });
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const message = [
    'Olá! Gostaria de solicitar um orçamento:',
    '',
    ...lines,
    '',
    `*Total: ${formatCurrency(total)}*`,
    '',
    'Aguardo retorno. Obrigado!',
  ].join('\n');

  // wa.me redireciona para api.whatsapp.com e, nesse redirect, corrompe emojis fora do plano
  // básico (4 bytes UTF-8, ex.: 📦) — usamos o domínio final direto para evitar esse bug.
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}
