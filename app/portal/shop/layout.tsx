"use client"

import { ShopPathsProvider } from "@/components/shop/shop-paths"

export default function PortalShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopPathsProvider surface="portal">{children}</ShopPathsProvider>
}
