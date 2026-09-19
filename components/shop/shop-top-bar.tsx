"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlignJustify, ChevronLeft, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/store/cart-store"
import { useAuth } from "@/lib/hooks/use-auth"
import { portalCanvasTitle } from "@/components/portal/styles"

export function ShopTopBar({ title }: { title: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const totalItems = useCartStore((state) => state.getTotalItems())

  return (
    <div className={`flex items-center justify-between gap-3 ${portalCanvasTitle}`}>
      <div className="flex min-w-0 items-center gap-1">
        <button type="button" onClick={() => router.back()} className="rounded-md p-1" aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="truncate text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <Link
            href="/portal/shop/orders"
            className="rounded-md bg-[#7F1D1D] p-2 text-white"
            aria-label="Orders"
          >
            <AlignJustify className="h-5 w-5" />
          </Link>
        ) : null}
        <Link
          href="/portal/shop/cart"
          className="relative rounded-md bg-[#7F1D1D] p-2 text-white"
          aria-label="Cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 ? (
            <Badge className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center border-none bg-white p-0 text-[10px] text-[#DC2626]">
              {totalItems > 9 ? "9+" : totalItems}
            </Badge>
          ) : null}
        </Link>
      </div>
    </div>
  )
}
