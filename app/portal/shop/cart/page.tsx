"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Minus, Plus, Trash2 } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()

  // Mock products for demo
  const products = [
    { id: "1", name: "Black T-shirt", price: 15000, image: "/tshirt-black.jpg" },
    { id: "2", name: "Yellow T-shirt", price: 15000, image: "/tshirt-yellow.jpg" },
    { id: "3", name: "Black Golf Shirt", price: 25000, image: "/golfshirt-black.jpg" },
  ]

  const total = getTotalPrice(products)

  if (items.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 text-white mb-6">
          <button onClick={() => router.back()}>
            <ChevronRight className="h-6 w-6 rotate-180" />
          </button>
          <h1 className="text-xl font-semibold">Shopping Cart</h1>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-none">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add items to your cart to continue shopping</p>
            <Button
              onClick={() => router.push("/portal/shop")}
              className="bg-leo-primary hover:bg-leo-primary-dark text-white"
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()}>
            <ChevronRight className="h-6 w-6 rotate-180" />
          </button>
          <h1 className="text-xl font-semibold">Shopping Cart</h1>
        </div>
        <button onClick={clearCart} className="text-sm hover:underline">
          Clear All
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const product = products.find((p) => p.id === item.productId)
          if (!product) return null

          return (
            <Card key={item.productId} className="bg-white/90 backdrop-blur-sm border-none">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-leo-primary font-bold mb-2">MWK {product.price.toLocaleString()}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-red-500 p-2">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary */}
      <Card className="bg-white/90 backdrop-blur-sm border-none">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">MWK {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium">MWK 2,000</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-leo-primary">MWK {(total + 2000).toLocaleString()}</span>
            </div>
          </div>
          <Button
            onClick={() => router.push("/portal/shop/checkout")}
            className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white"
          >
            Proceed to Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
