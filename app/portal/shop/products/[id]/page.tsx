"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ShoppingCart, Heart, Star } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCartStore()
  const [selectedSize, setSelectedSize] = useState("M")
  const [selectedColor, setSelectedColor] = useState("Black")

  // Mock product data - in production, fetch from Firestore
  const product = {
    id: resolvedParams.id,
    name: "Black Leo Club T-Shirt",
    description:
      "Premium quality cotton t-shirt with Leo Club logo. Perfect for events and daily wear. Made with 100% cotton for maximum comfort and durability.",
    category: "tshirt",
    price: 15000,
    images: ["/placeholder.svg"],
    stock: 50,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Yellow"],
    rating: 4.5,
    reviews: 12,
  }

  const handleAddToCart = () => {
    addItem(product as any, 1, selectedSize, selectedColor)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()}>
            <ChevronRight className="h-6 w-6 rotate-180" />
          </button>
          <h1 className="text-xl font-semibold">Product Details</h1>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Product Image */}
      <Card className="bg-white/90 backdrop-blur-sm border-none overflow-hidden">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
          {product.stock < 10 && (
            <Badge className="absolute top-4 left-4 bg-amber-500 text-white border-none">Low Stock</Badge>
          )}
        </div>
      </Card>

      {/* Product Info */}
      <Card className="bg-white/90 backdrop-blur-sm border-none">
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
            </div>
            <p className="text-3xl font-bold text-leo-primary mb-4">MWK {product.price.toLocaleString()}</p>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Size Selection */}
          {product.sizes && (
            <div>
              <h3 className="font-semibold mb-3">Select Size</h3>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      selectedSize === size
                        ? "border-leo-primary bg-leo-primary text-white"
                        : "border-gray-300 hover:border-leo-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && (
            <div>
              <h3 className="font-semibold mb-3">Select Color</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      selectedColor === color
                        ? "border-leo-primary bg-leo-primary text-white"
                        : "border-gray-300 hover:border-leo-primary"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Info */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Available:</span>
            <span className="font-medium text-green-600">{product.stock} in stock</span>
          </div>
        </CardContent>
      </Card>

      {/* Add to Cart Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-[#991B1B] via-[#991B1B] to-transparent pt-6">
        <div className="container max-w-screen-sm mx-auto">
          <Button onClick={handleAddToCart} className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white h-12">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
