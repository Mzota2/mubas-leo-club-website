"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCartStore } from "@/lib/store/cart-store"
import { getShopProduct, shopProducts } from "@/lib/shop/catalog"
import { useToast } from "@/hooks/use-toast"
import { formatMoney } from "@/lib/utils/format"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"

const DELIVERY_FEE = 2000

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const subtotal = getTotalPrice(shopProducts)
  const total = subtotal + DELIVERY_FEE

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/portal/shop/cart")
    }
  }, [items.length, router])

  const handlePayment = async () => {
    setIsProcessing(true)
    window.setTimeout(() => {
      clearCart()
      toast({
        title: "Order placed",
        description: "Payment received. Check your email for confirmation.",
      })
      router.push("/portal/shop/orders")
      setIsProcessing(false)
    }, 1200)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="space-y-5 px-4 py-5 lg:px-6 lg:py-8">
      <div className={`flex items-center gap-1 ${portalCanvasTitle}`}>
        <button type="button" onClick={() => router.back()} className="rounded-md p-1" aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold">Checkout</h1>
      </div>

      <div className="space-y-4 rounded-md bg-white p-4">
        <h2 className="font-semibold">Delivery</h2>
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" placeholder="Your name" className="mt-1 rounded-md" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" placeholder="+265 999 123 456" className="mt-1 rounded-md" />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" placeholder="Delivery address" rows={3} className="mt-1 rounded-md" />
        </div>
      </div>

      <div className="space-y-3 rounded-md bg-white p-4">
        <h2 className="font-semibold">Order</h2>
        {items.map((item) => {
          const product = getShopProduct(item.productId)
          if (!product) return null
          return (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-neutral-600">
                {product.name} × {item.quantity}
              </span>
              <span className="font-medium">{formatMoney(product.price * item.quantity)}</span>
            </div>
          )
        })}
        <div className="flex justify-between border-t pt-3 text-sm">
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
      </div>

      <div className="flex items-center gap-3 rounded-md border-2 border-leo-primary bg-leo-primary/5 p-4">
        <CreditCard className="h-6 w-6 text-leo-primary" />
        <div>
          <p className="font-medium">PayChangu</p>
          <p className="text-sm text-neutral-600">Mobile money checkout</p>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="h-12 w-full rounded-md bg-[#F59E0B] text-white hover:bg-[#D97706]"
      >
        {isProcessing ? "Processing..." : `Pay ${formatMoney(total)}`}
      </Button>
      <p className={`text-center text-xs ${portalCanvasMuted}`}>By placing this order you agree to club shop terms.</p>
    </div>
  )
}
