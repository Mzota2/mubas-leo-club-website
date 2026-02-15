"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Menu } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const totalItems = useCartStore((state) => state.getTotalItems())

  const categories = [
    { id: "all", label: "All", image: "/valentines-special.jpg" },
    { id: "tshirt", label: "T-shirts", image: "/tshirt-category.jpg" },
    { id: "golfshirt", label: "Golf-Shirts", image: "/golfshirt-category.jpg" },
    { id: "cap", label: "Caps", image: "/caps-category.jpg" },
    { id: "mug", label: "Mugs", image: "/mugs-category.jpg" },
    { id: "calendar", label: "Calendars", image: "/calendars-category.jpg" },
  ]

  const products = [
    {
      id: "1",
      name: "Black T-shirt",
      category: "tshirt",
      price: 15000,
      image: "/tshirt-black.jpg",
      inStock: true,
    },
    {
      id: "2",
      name: "Yellow T-shirt",
      category: "tshirt",
      price: 15000,
      image: "/tshirt-yellow.jpg",
      inStock: true,
    },
    {
      id: "3",
      name: "Black Golf Shirt",
      category: "golfshirt",
      price: 25000,
      image: "/golfshirt-black.jpg",
      inStock: true,
    },
    {
      id: "4",
      name: "Green Golf Shirt",
      category: "golfshirt",
      price: 25000,
      image: "/golfshirt-green.jpg",
      inStock: true,
    },
  ]

  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((p) => p.category === selectedCategory)

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between text-white">
        <h1 className="text-xl font-bold">Shop Now</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-white/10 rounded-lg">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/portal/shop/cart" className="relative p-2 bg-white/10 rounded-lg">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-white text-leo-primary text-xs">
                {totalItems}
              </Badge>
            )}
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="What do you want to buy ?"
          className="pl-10 bg-white/90 backdrop-blur-sm border-none rounded-xl h-12"
        />
      </div>

      {/* Featured Banner */}
      <Card className="bg-gradient-to-br from-red-600 to-pink-600 border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-video relative">
            <img src="/images/shop.png" alt="Valentines Special" className="w-full h-full object-cover" />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div>
        <h2 className="text-white font-semibold mb-4">Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-white text-leo-primary"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">
            {selectedCategory === "all" ? "All Products" : categories.find((c) => c.id === selectedCategory)?.label}
          </h2>
          <Link href="/portal/shop/products" className="text-white text-sm">
            See all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <Link key={product.id} href={`/portal/shop/products/${product.id}`}>
              <Card className="bg-white/90 backdrop-blur-sm border-none overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {product.inStock && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓</div>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                  <p className="text-leo-primary font-bold">MWK {product.price.toLocaleString()}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Product Description Card */}
      {selectedCategory === "tshirt" && (
        <Card className="bg-gradient-to-br from-[#92400E] to-[#78350F] text-white border-none">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">T-shirts</h3>
            <p className="text-sm opacity-90 mb-4">
              High-quality Leo Club branded t-shirts. Available in various colors and sizes. Perfect for events and
              everyday wear.
            </p>
            <Button className="bg-[#F59E0B] hover:bg-[#D97706] text-white w-full">View All T-shirts</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
