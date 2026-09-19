"use client"

import { ShopPathsProvider } from "@/components/shop/shop-paths"

export default function PublicShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopPathsProvider surface="public">
      <div className="bg-[#F6F3EE]">
        <div className="mx-auto w-full max-w-lg min-w-0 lg:max-w-6xl">{children}</div>
      </div>
    </ShopPathsProvider>
  )
}
