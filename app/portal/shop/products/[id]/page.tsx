"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShopTopBar } from "@/components/shop/shop-top-bar"
import { ProductArt } from "@/components/shop/product-art"
import { getShopCategory, getShopProduct } from "@/lib/shop/catalog"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { formatMoney } from "@/lib/utils/format"
import { portalCanvasMuted } from "@/components/portal/styles"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = getShopProduct(id)
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()

  if (!product) {
    notFound()
  }

  const category = getShopCategory(product.category)

  const handleAdd = () => {
    addItem(product, 1)
    toast({
      title: "Added to cart",
      description: `${product.name} is in your cart.`,
    })
  }

  return (
    <div className="space-y-5 px-4 py-5 lg:px-6 lg:py-8">
      <ShopTopBar title={product.name} />

      <div className="overflow-hidden rounded-md bg-white">
        <ProductArt product={product} className="aspect-square w-full" />
      </div>

      <div className="rounded-md bg-[#7F1D1D] p-5 text-white">
        <p className="text-sm text-white/80">{category?.label}</p>
        <h2 className="mt-1 text-xl font-semibold">{product.name}</h2>
        <p className="mt-3 text-sm text-white/85">{product.description}</p>
        <p className="mt-4 text-lg font-semibold text-[#F59E0B]">{formatMoney(product.price)}</p>
      </div>

      <Button
        onClick={handleAdd}
        className="h-11 w-full rounded-md bg-[#F59E0B] text-white hover:bg-[#D97706]"
      >
        Add to Cart
      </Button>
      <Link href={`/portal/shop/category/${product.category}`} className={`block text-center text-sm ${portalCanvasMuted}`}>
        See more {category?.label}
      </Link>
    </div>
  )
}
