import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface SelectedVariation {
  name: string;
  value: string;
}

export interface CartItem {
  cartItemId: string; // productId + variation key (composite)
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedVariation: SelectedVariation | null;
}

export interface AddItemParams {
  productId: string;
  name: string;
  unitPrice: number;
  selectedVariation?: SelectedVariation | null;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: AddItemParams, quantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const STORAGE_KEY = 'maxhub_cart_v2';

const CartContext = createContext<CartContextValue | undefined>(undefined);

function makeCartItemId(productId: string, variation: SelectedVariation | null | undefined): string {
  if (!variation) return productId;
  return `${productId}__${variation.name}:${variation.value}`;
}

function readStoredItems(): CartItem[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? (JSON.parse(stored) as CartItem[]) : [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredItems);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item: AddItemParams, quantity = 1) {
    const cartItemId = makeCartItemId(item.productId, item.selectedVariation);
    setItems((current) => {
      const existing = current.find((i) => i.cartItemId === cartItemId);
      if (existing) {
        return current.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...current,
        {
          cartItemId,
          productId: item.productId,
          name: item.name,
          quantity,
          unitPrice: item.unitPrice,
          selectedVariation: item.selectedVariation ?? null,
        },
      ];
    });
  }

  function removeItem(cartItemId: string) {
    setItems((current) => current.filter((i) => i.cartItemId !== cartItemId));
  }

  function updateQuantity(cartItemId: string, quantity: number) {
    setItems((current) =>
      current.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext deve ser usado dentro de um CartProvider');
  }
  return context;
}
