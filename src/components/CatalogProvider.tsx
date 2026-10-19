"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Product } from "@/lib/products";

const CatalogContext = createContext<Product[] | null>(null);

export function CatalogProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  return (
    <CatalogContext.Provider value={products}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const products = useContext(CatalogContext);
  if (!products) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return products;
}
