"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, CreditCard } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const products = [
    { id: "1", name: "Black T-shirt", price: 15000 },
    { id: "2", name: "Yellow T-shirt", price: 15000 },
    { id: "3", name: "Black Golf Shirt", price: 25000 },
  ]

  const subtotal = getTotalPrice(products)
  const deliveryFee = 2000
  const total = subtotal + deliveryFee

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate PayChangu integration
    setTimeout(() => {
      clearCart()
      toast({
        title: "Order Placed Successfully",
        description: "Your payment has been processed. Check your email for confirmation.",
      })
      router.push("/portal/shop/orders")
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-white">
        <button onClick={() => router.back()}>
          <ChevronRight className="h-6 w-6 rotate-180" />
        </button>
        <h1 className="text-xl font-semibold">Checkout</h1>
      </div>

      {/* Shipping Information */}
      <Card className="bg-white/90 backdrop-blur-sm border-none">
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="John Doe" />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="+265 999 123 456" />
          </div>

          <div>
            <Label htmlFor="address">Delivery Address</Label>
            <Textarea id="address" placeholder="Enter your full address" rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="bg-white/90 backdrop-blur-sm border-none">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId)
            if (!product) return null

            return (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {product.name} x {item.quantity}
                </span>
                <span className="font-medium">MWK {(product.price * item.quantity).toLocaleString()}</span>
              </div>
            )
          })}

          <div className="flex justify-between text-sm border-t pt-3">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">MWK {subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium">MWK {deliveryFee.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>Total</span>
            <span className="text-leo-primary">MWK {total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="bg-white/90 backdrop-blur-sm border-none">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 border-2 border-leo-primary rounded-lg bg-leo-primary/5">
            <CreditCard className="h-6 w-6 text-leo-primary" />
            <div>
              <p className="font-medium">PayChangu</p>
              <p className="text-sm text-gray-600">Secure mobile money payment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white h-12"
      >
        {isProcessing ? "Processing..." : `Pay MWK ${total.toLocaleString()}`}
      </Button>

      <p className="text-center text-xs text-white/80">By placing this order, you agree to our terms and conditions</p>
    </div>
  )
}
