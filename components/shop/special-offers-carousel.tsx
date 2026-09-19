"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatMoney } from "@/lib/utils/format"
import type { SpecialOffer } from "@/lib/types"
import { useShopPaths } from "@/components/shop/shop-paths"

function offerTag(offer: SpecialOffer) {
  const source = offer.tagline || offer.title
  const compact = source.replace(/[^a-zA-Z0-9]+/g, "")
  return compact ? `#${compact}` : "#SpecialOffer"
}

function OfferCard({
  offer,
  duplicate = false,
}: {
  offer: SpecialOffer
  duplicate?: boolean
}) {
  const paths = useShopPaths()

  return (
    <Link
      href={paths.offer(offer.id)}
      tabIndex={duplicate ? -1 : undefined}
      aria-hidden={duplicate || undefined}
      className="relative w-40 shrink-0 overflow-hidden rounded-md bg-white lg:w-52"
    >
      {offer.image ? (
        <img src={offer.image} alt={duplicate ? "" : offer.title} className="h-52 w-full object-cover" />
      ) : (
        <div className="h-52 w-full bg-[#7F1D1D]" />
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-2.5 pb-2.5 pt-8">
        <span className="block text-sm font-semibold text-white">{offerTag(offer)}</span>
        <span className="mt-0.5 block text-xs text-white/90">{offer.title}</span>
        <span className="mt-0.5 block text-xs font-medium text-[#F59E0B]">{formatMoney(offer.price)}</span>
      </span>
    </Link>
  )
}

export function SpecialOffersCarousel({ offers }: { offers: SpecialOffer[] }) {
  const paths = useShopPaths()
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  if (offers.length === 0) return null

  const animate = offers.length > 1 && !reduceMotion
  const unit = animate
    ? Array.from({ length: Math.max(2, Math.ceil(8 / offers.length)) }, () => offers).flat()
    : offers
  const track = animate ? [...unit, ...unit] : unit
  const duration = Math.max(18, unit.length * 4)

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className={`font-semibold ${paths.titleClass}`}>Special offers</h2>
      </div>

      {animate ? (
        <div className="offers-marquee-wrap overflow-hidden">
          <div
            className="offer-marquee flex w-max gap-3"
            style={{ animationDuration: `${duration}s` }}
          >
            {track.map((offer, index) => (
              <OfferCard key={`${offer.id}-${index}`} offer={offer} duplicate={index >= unit.length} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </section>
  )
}
