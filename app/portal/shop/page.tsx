"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ShopSearch } from "@/components/shop/shop-search"
import { ShopTopBar } from "@/components/shop/shop-top-bar"
import { ProductArt } from "@/components/shop/product-art"
import { SpecialOffersCarousel } from "@/components/shop/special-offers-carousel"
import { useShopPaths } from "@/components/shop/shop-paths"
import { getProductsByCategory, shopCategories, shopProducts } from "@/lib/shop/catalog"
import { offerIdFromProductId, offerToShopProduct } from "@/lib/shop/offers"
import { useSpecialOffers } from "@/lib/hooks/use-special-offers"
import { formatMoney } from "@/lib/utils/format"

export default function ShopPage() {
  const paths = useShopPaths()
  const [query, setQuery] = useState("")
  const { data: offers = [] } = useSpecialOffers(true)

  const offerProducts = useMemo(() => offers.map(offerToShopProduct), [offers])

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const catalog = q
      ? shopProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(q) ||
            product.hashtag.toLowerCase().includes(q) ||
            product.category.toLowerCase().includes(q),
        )
      : shopProducts
    const matchingOffers = q
      ? offerProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(q) ||
            product.hashtag.toLowerCase().includes(q) ||
            product.description.toLowerCase().includes(q),
        )
      : []
    return [...matchingOffers, ...catalog]
  }, [offerProducts, query])

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return shopCategories
    return shopCategories.filter((category) =>
      getProductsByCategory(category.id).some((product) => visibleProducts.includes(product)),
    )
  }, [query, visibleProducts])

  return (
    <div className="space-y-5 px-4 py-5 lg:px-6 lg:py-8">
      <ShopTopBar title="Shop Now" />
      <ShopSearch value={query} onChange={setQuery} />

      {!query.trim() ? <SpecialOffersCarousel offers={offers} /> : null}

      <section className="space-y-3">
        <h2 className={`font-semibold ${paths.titleClass}`}>Categories</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {filteredCategories.map((category) => {
            const thumbs = getProductsByCategory(category.id).slice(0, 2)
            return (
              <Link
                key={category.id}
                href={paths.category(category.id)}
                className="flex items-center gap-3 rounded-md bg-white p-2 pr-3 shadow-sm"
              >
                <p className="w-[4.5rem] shrink-0 text-sm font-semibold leading-tight text-neutral-900 sm:w-24 sm:text-base">
                  {category.label}
                </p>
                <div className="flex min-w-0 flex-1 gap-2">
                  {thumbs.map((product) => (
                    <ProductArt key={product.id} product={product} className="h-[4.5rem] w-[4.5rem] shrink-0" />
                  ))}
                </div>
                <ChevronRight className="h-6 w-6 shrink-0 text-[#7F1D1D]" />
              </Link>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={`font-semibold ${paths.titleClass}`}>In the shop</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {visibleProducts.map((product) => {
            const offerId = offerIdFromProductId(product.id)
            return (
              <Link
                key={product.id}
                href={offerId ? paths.offer(offerId) : paths.product(product.id)}
                className="overflow-hidden rounded-md bg-white shadow-sm"
              >
                <ProductArt product={product} className="aspect-square" />
                <div className="space-y-0.5 px-2.5 py-2">
                  <p className="line-clamp-1 text-sm font-medium text-neutral-900">{product.name}</p>
                  <p className="text-xs font-semibold text-leo-primary">{formatMoney(product.price)}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
