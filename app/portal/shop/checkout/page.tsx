"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCartStore } from "@/lib/store/cart-store"
import { buildOrderItems, cartLineToProduct, DELIVERY_FEE, GUEST_ORDER_USER_ID, orderItemsTotal } from "@/lib/shop/checkout"
import { initiatePayment } from "@/lib/paychangu/client"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { formatMoney } from "@/lib/utils/format"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { items, getTotalPrice } = useCartStore()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const orderItems = useMemo(() => buildOrderItems(items), [items])
  const subtotal = orderItems.length ? orderItemsTotal(orderItems) : getTotalPrice()
  const total = subtotal + DELIVERY_FEE

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/portal/shop/cart")
    }
  }, [items.length, router])

  useEffect(() => {
    if (!user) return
    if (!fullName) setFullName(`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim())
    if (!email) setEmail(user.email ?? "")
    if (!phone) setPhone(user.phone ?? "")
  }, [email, fullName, phone, user])

  const handlePayment = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      toast({
        title: "Delivery details required",
        description: "Enter your name, email, phone, and delivery address.",
        variant: "destructive",
      })
      return
    }
    if (!isValidEmail(email)) {
      toast({
        title: "Valid email required",
        description: "We need an email to send the payment receipt.",
        variant: "destructive",
      })
      return
    }
    if (orderItems.length === 0) {
      toast({ title: "Cart is empty", description: "Add items before paying.", variant: "destructive" })
      return
    }

    setIsProcessing(true)
    try {
      const nameParts = fullName.trim().split(/\s+/)
      const result = await initiatePayment({
        amount: total,
        email: email.trim(),
        firstName: nameParts[0] || "Guest",
        lastName: nameParts.slice(1).join(" ") || "Shopper",
        currency: "MWK",
        purpose: "order",
        userId: user?.id || GUEST_ORDER_USER_ID,
        customerName: fullName.trim(),
        phone: phone.trim(),
        shippingAddress: address.trim(),
        items: orderItems,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        returnUrl: `${window.location.origin}/portal/shop/checkout/return`,
        customization: {
          title: "MUBAS Leo Club shop",
          description: `Order of ${orderItems.length} item${orderItems.length === 1 ? "" : "s"} for ${formatMoney(total)}`,
        },
      })
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl
        return
      }
      toast({
        title: "Payment error",
        description: result.error || "Could not start PayChangu checkout.",
        variant: "destructive",
      })
    } catch {
      toast({ title: "Payment error", description: "Try again in a moment.", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
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
        <h2 className="font-semibold">Your details</h2>
        <p className="text-sm text-neutral-600">
          {user ? "Confirm where we should send this order." : "No account needed. Enter the details we need to deliver and receipt this order."}
        </p>
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Your name"
            className="mt-1 rounded-md"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            className="mt-1 rounded-md"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+265 999 123 456"
            className="mt-1 rounded-md"
          />
        </div>
        <div>
          <Label htmlFor="address">Delivery address</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Street, area, city"
            rows={3}
            className="mt-1 rounded-md"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-md bg-white p-4">
        <h2 className="font-semibold">Order</h2>
        {items.map((item) => {
          const product = cartLineToProduct(item)
          if (!product) return null
          return (
            <div key={`${item.productId}-${item.size ?? ""}-${item.color ?? ""}`} className="flex justify-between text-sm">
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
          <p className="text-sm text-neutral-600">You will be redirected to complete mobile money payment.</p>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="h-12 w-full rounded-md bg-[#F59E0B] text-white hover:bg-[#D97706]"
      >
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isProcessing ? "Redirecting to PayChangu..." : `Pay ${formatMoney(total)}`}
      </Button>
      <p className={`text-center text-xs ${portalCanvasMuted}`}>By placing this order you agree to club shop terms.</p>
    </div>
  )
}
