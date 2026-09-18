"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductArt } from "@/components/shop/product-art"
import { useCartStore } from "@/lib/store/cart-store"
import { getShopProduct, shopProducts } from "@/lib/shop/catalog"
import { formatMoney } from "@/lib/utils/format"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"
import { DELIVERY_FEE } from "@/lib/shop/checkout"

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  const subtotal = getTotalPrice(shopProducts)
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0)

  return (
    <div className="space-y-5 px-4 py-5 lg:px-6 lg:py-8">
      <div className={`flex items-center justify-between ${portalCanvasTitle}`}>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => router.back()} className="rounded-md p-1" aria-label="Back">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">Cart</h1>
        </div>
        {items.length > 0 ? (
          <button type="button" onClick={clearCart} className="text-sm hover:underline">
            Clear
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-md bg-white p-8 text-center">
          <p className="font-semibold text-neutral-900">Your cart is empty</p>
          <p className="mt-1 text-sm text-neutral-600">Pick a category and add something simple.</p>
          <Button asChild className="mt-5 rounded-md bg-leo-primary text-white hover:bg-leo-primary-dark">
            <Link href="/portal/shop">Continue shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => {
              const product = getShopProduct(item.productId)
              if (!product) return null

              return (
                <div key={item.productId} className="flex gap-3 rounded-md bg-white p-3">
                  <ProductArt product={product} className="h-20 w-20 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-neutral-900">{product.name}</h3>
                    <p className="text-sm font-medium text-leo-primary">{formatMoney(product.price)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="rounded-md bg-neutral-100 p-1"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="rounded-md bg-neutral-100 p-1"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="rounded-md p-1 text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-3 rounded-md bg-white p-5">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-medium">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Delivery</span>
              <span className="font-medium">{formatMoney(DELIVERY_FEE)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Total</span>
              <span className="text-leo-primary">{formatMoney(total)}</span>
            </div>
            <Button
              onClick={() => router.push("/portal/shop/checkout")}
              className="h-11 w-full rounded-md bg-[#F59E0B] text-white hover:bg-[#D97706]"
            >
              Checkout
            </Button>
          </div>
        </>
      )}

      <p className={`text-center text-xs ${portalCanvasMuted}`}>Pay with PayChangu at checkout</p>
    </div>
  )
}
