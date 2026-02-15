"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/portal/shop/products/${product.id}`}>
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          {product.images[0] ? (
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
          )}
          {product.stock === 0 && (
            <Badge className="absolute top-2 left-2 bg-gray-500 text-white border-none">Out of Stock</Badge>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <Badge className="absolute top-2 left-2 bg-amber-500 text-white border-none">Low Stock</Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-leo-primary">MWK {product.price.toLocaleString()}</span>
          {onAddToCart && product.stock > 0 && (
            <Button
              size="sm"
              onClick={() => onAddToCart(product.id)}
              className="bg-leo-primary hover:bg-leo-primary-dark"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
