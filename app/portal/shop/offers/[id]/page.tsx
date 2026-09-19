"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShopTopBar } from "@/components/shop/shop-top-bar"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { formatMoney } from "@/lib/utils/format"
import { useShopPaths } from "@/components/shop/shop-paths"
import { useSpecialOffer } from "@/lib/hooks/use-special-offers"
import { offerToShopProduct } from "@/lib/shop/offers"

export default function SpecialOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const paths = useShopPaths()
  const { data: offer, isLoading } = useSpecialOffer(id)
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()

  if (!isLoading && !offer) {
    notFound()
  }

  if (!offer) {
    return (
      <div className="space-y-5 px-4 py-5 lg:px-6 lg:py-8">
        <ShopTopBar title="Special offer" />
        <div className="h-56 animate-pulse rounded-md bg-white/70" />
      </div>
    )
  }

  const product = offerToShopProduct(offer)

  const handleAdd = () => {
    addItem(product, 1)
    toast({
      title: "Added to cart",
      description: `${offer.title} is in your cart.`,
    })
  }

  return (
    <div className="space-y-5 px-4 py-5 lg:px-6 lg:py-8">
      <ShopTopBar title={offer.title} />

      <div className="overflow-hidden rounded-md bg-white">
        {offer.image ? (
          <img src={offer.image} alt={offer.title} className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-[#7F1D1D] text-white">
            {offer.tagline || "Special offer"}
          </div>
        )}
      </div>

      <div className="rounded-md bg-[#7F1D1D] p-5 text-white">
        {offer.tagline ? <p className="text-sm font-semibold uppercase tracking-wide text-[#F59E0B]">{offer.tagline}</p> : null}
        <h2 className="mt-1 text-xl font-semibold">{offer.title}</h2>
        <p className="mt-3 text-sm text-white/85">{offer.description}</p>
        <p className="mt-4 text-lg font-semibold text-[#F59E0B]">{formatMoney(offer.price)}</p>
      </div>

      <Button
        onClick={handleAdd}
        className="h-11 w-full rounded-md bg-[#F59E0B] text-white hover:bg-[#D97706]"
      >
        Add to Cart
      </Button>
      <Link href={paths.home} className={`block text-center text-sm ${paths.mutedClass}`}>
        Back to shop
      </Link>
    </div>
  )
}
