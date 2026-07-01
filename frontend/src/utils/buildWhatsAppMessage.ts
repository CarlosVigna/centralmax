import type { CartItem } from '../contexts/CartContext';
import { formatCurrency } from './formatCurrency';

function variationLabel(item: CartItem): string {
  if (!item.selectedVariation) return '';
  return ` (${item.selectedVariation.name}: ${item.selectedVariation.value})`;
}

export function buildWhatsAppMessage(items: CartItem[]): string {
  const lines = items.map((item) => {
    const subtotal = item.quantity * item.unitPrice;
    return `📦 *${item.name}*${variationLabel(item)} x${item.quantity} — ${formatCurrency(subtotal)}`;
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

  const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}

export function buildSingleProductWhatsApp(
  name: string,
  quantity: number,
  variation: { name: string; value: string } | null,
): string {
  const variationPart = variation ? `, ${variation.name}: ${variation.value}` : '';
  const message = `Olá! Tenho interesse no produto: *${name}* (Qtd: ${quantity}${variationPart}). Poderia me passar mais informações?`;
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}
