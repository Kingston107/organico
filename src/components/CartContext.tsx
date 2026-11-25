'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { calculateShippingInr } from '@/lib/catalog';
import type { CartItem, Product } from '@/types/store';

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotalInr: number;
  shippingInr: number;
  totalInr: number;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'organico_cart_v1';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore malformed storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (entry) => entry.product.slug === product.slug
      );
      if (existing) {
        return prev.map((entry) =>
          entry.product.slug === product.slug
            ? { ...entry, quantity: Math.min(20, entry.quantity + quantity) }
            : entry
        );
      }
      return [
        ...prev,
        { product, quantity: Math.min(20, Math.max(1, quantity)) },
      ];
    });
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((entry) => entry.product.slug !== slug));
      return;
    }
    setItems((prev) =>
      prev.map((entry) =>
        entry.product.slug === slug
          ? { ...entry, quantity: Math.min(20, quantity) }
          : entry
      )
    );
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((entry) => entry.product.slug !== slug));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, entry) => sum + entry.quantity, 0);
    const subtotalInr = items.reduce(
      (sum, entry) => sum + entry.product.priceInr * entry.quantity,
      0
    );
    const shippingInr = calculateShippingInr(subtotalInr);
    return {
      items,
      totalItems,
      subtotalInr,
      shippingInr,
      totalInr: subtotalInr + shippingInr,
      assistantOpen,
      setAssistantOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items, assistantOpen, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
