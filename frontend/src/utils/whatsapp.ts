import type { CartItem, SelectedVariation } from '../contexts/CartContext';
import { formatCurrency } from './formatCurrency';

function makeUrl(message: string): string {
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}

function variationLabel(variation: SelectedVariation | null | undefined): string {
  if (!variation) return '';
  return ` (${variation.name}: ${variation.value})`;
}

/**
 * Mensagem de carrinho — pedido ou orçamento dependendo dos preços.
 * isOrder=true  → "gostaria de fazer um pedido"
 * isOrder=false → "gostaria de solicitar um orçamento"
 */
export function buildCartWhatsAppUrl(
  items: CartItem[],
  customerName: string | null,
  isOrder: boolean,
): string {
  const namePart = customerName ? `Meu nome é *${customerName}* e ` : '';
  const intent = isOrder ? 'fazer um pedido' : 'solicitar um orçamento';

  const lines = items.map((item) => {
    const subtotal = item.quantity * item.unitPrice;
    return `📦 *${item.name}*${variationLabel(item.selectedVariation)} x${item.quantity} — ${formatCurrency(subtotal)}`;
  });

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const message = [
    `Olá! ${namePart}gostaria de ${intent}:`,
    '',
    ...lines,
    '',
    `*Total: ${formatCurrency(total)}*`,
    '',
    'Aguardo confirmação. Obrigado!',
  ].join('\n');

  return makeUrl(message);
}

/**
 * Mensagem de interesse em produto individual (botão no modal).
 */
export function buildProductWhatsAppUrl(
  productName: string,
  quantity: number,
  variation: SelectedVariation | null,
  customerName: string | null,
): string {
  const namePart = customerName ? `Meu nome é *${customerName}* e ` : '';
  const varPart = variation ? `, ${variation.name}: ${variation.value}` : '';

  const message = [
    `Olá! ${namePart}tenho interesse no produto:`,
    `*${productName}* (Qtd: ${quantity}${varPart})`,
    'Poderia me passar mais informações e o valor?',
  ].join('\n');

  return makeUrl(message);
}
