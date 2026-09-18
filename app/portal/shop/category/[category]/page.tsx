"use client"

import { use, useMemo, useState } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShopSearch } from "@/components/shop/shop-search"
import { ShopTopBar } from "@/components/shop/shop-top-bar"
import { ProductArt } from "@/components/shop/product-art"
import { getProductsByCategory, getShopCategory } from "@/lib/shop/catalog"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { formatMoney } from "@/lib/utils/format"
import type { ShopCategoryId } from "@/lib/shop/catalog"

export default function ShopCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ product?: string }>
}) {
  const { category: categoryId } = use(params)
  const { product: productId } = use(searchParams)
  const category = getShopCategory(categoryId)
  const products = getProductsByCategory(categoryId as ShopCategoryId)
  const initial = products.find((product) => product.id === productId) ?? products[0]
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(initial?.id ?? "")
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) || product.hashtag.toLowerCase().includes(q),
    )
  }, [products, query])

  const selected = visible.find((product) => product.id === selectedId) ?? visible[0] ?? products[0]

  if (!category || !selected) {
    notFound()
  }

  const handleAdd = () => {
    addItem(selected, 1)
    toast({
      title: "Added to cart",
      description: `${selected.name} is in your cart.`,
    })
  }

  return (
    <div className="space-y-5 px-4 py-5 lg:px-6 lg:py-8">
      <ShopTopBar title={category.label} />
      <ShopSearch value={query} onChange={setQuery} />

      <div className="flex gap-3 overflow-x-auto pb-1">
        {visible.map((product) => {
          const active = product.id === selected.id
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => setSelectedId(product.id)}
              className="w-36 shrink-0 overflow-hidden rounded-md bg-white text-left"
            >
              <ProductArt product={product} selected={active} className="aspect-square" />
              <p className="px-2 py-2 text-xs font-medium text-neutral-700">{product.hashtag}</p>
            </button>
          )
        })}
      </div>

      <div className="rounded-md bg-[#7F1D1D] p-5 text-white">
        <h2 className="font-semibold">{category.label}</h2>
        <p className="mt-2 text-sm text-white/85">{selected.description}</p>
        <p className="mt-3 text-sm font-semibold text-[#F59E0B]">{formatMoney(selected.price)}</p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleAdd}
          className="h-11 min-w-48 rounded-md bg-[#F59E0B] px-8 text-white hover:bg-[#D97706]"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
