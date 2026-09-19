"use client"

import { createContext, useContext, type ReactNode } from "react"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"

export type ShopSurface = "portal" | "public"

export type ShopPaths = {
  surface: ShopSurface
  home: string
  cart: string
  checkout: string
  checkoutReturn: string
  orders: string
  payments: string
  product: (id: string) => string
  category: (id: string) => string
  offer: (id: string) => string
  titleClass: string
  mutedClass: string
}

const PORTAL_PATHS: ShopPaths = {
  surface: "portal",
  home: "/portal/shop",
  cart: "/portal/shop/cart",
  checkout: "/portal/shop/checkout",
  checkoutReturn: "/portal/shop/checkout/return",
  orders: "/portal/shop/orders",
  payments: "/portal/payments",
  product: (id) => `/portal/shop/products/${id}`,
  category: (id) => `/portal/shop/category/${id}`,
  offer: (id) => `/portal/shop/offers/${id}`,
  titleClass: portalCanvasTitle,
  mutedClass: portalCanvasMuted,
}

const PUBLIC_PATHS: ShopPaths = {
  surface: "public",
  home: "/shop",
  cart: "/shop/cart",
  checkout: "/shop/checkout",
  checkoutReturn: "/shop/checkout/return",
  orders: "/shop",
  payments: "/shop",
  product: (id) => `/shop/products/${id}`,
  category: (id) => `/shop/category/${id}`,
  offer: (id) => `/shop/offers/${id}`,
  titleClass: "text-neutral-900",
  mutedClass: "text-neutral-500",
}

const ShopPathsContext = createContext<ShopPaths>(PORTAL_PATHS)

export function ShopPathsProvider({
  surface,
  children,
}: {
  surface: ShopSurface
  children: ReactNode
}) {
  return (
    <ShopPathsContext.Provider value={surface === "public" ? PUBLIC_PATHS : PORTAL_PATHS}>
      {children}
    </ShopPathsContext.Provider>
  )
}

export function useShopPaths() {
  return useContext(ShopPathsContext)
}
