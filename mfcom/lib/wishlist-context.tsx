"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Product } from "./mock-data";

type WishlistContextValue = {
  items: Product[];
  toggle: (product: Product) => void;
  isSaved: (productId: string) => boolean;
  remove: (productId: string) => void;
  count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "mfcom-wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // corrupt/unavailable storage — start empty rather than crash
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const toggle = useCallback((product: Product) => {
    setItems((prev) =>
      prev.some((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [product, ...prev]
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isSaved = useCallback((productId: string) => items.some((p) => p.id === productId), [items]);

  return (
    <WishlistContext.Provider value={{ items, toggle, isSaved, remove, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
