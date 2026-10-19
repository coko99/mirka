"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, priceValue, type Product } from "@/lib/products";

export type CartLine = {
  slug: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  items: { product: Product; qty: number; total: number }[];
  total: number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mirka-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      setLines([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const value = useMemo<CartContextValue>(() => {
    const items = lines
      .map((line) => {
        const product = getProduct(line.slug);
        if (!product) return null;
        const total = priceValue(product.price) * line.qty;
        return { product, qty: line.qty, total };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.qty, 0),
      items,
      total: items.reduce((sum, item) => sum + item.total, 0),
      add(slug, qty = 1) {
        setLines((current) => {
          const existing = current.find((line) => line.slug === slug);
          if (existing) {
            return current.map((line) =>
              line.slug === slug ? { ...line, qty: line.qty + qty } : line,
            );
          }
          return [...current, { slug, qty }];
        });
      },
      setQty(slug, qty) {
        setLines((current) =>
          qty <= 0
            ? current.filter((line) => line.slug !== slug)
            : current.map((line) =>
                line.slug === slug ? { ...line, qty } : line,
              ),
        );
      },
      remove(slug) {
        setLines((current) => current.filter((line) => line.slug !== slug));
      },
      clear() {
        setLines([]);
      },
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
