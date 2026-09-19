import type { SpecialOffer } from "@/lib/types"
import type { ShopProduct } from "@/lib/shop/catalog"

export function offerToShopProduct(offer: SpecialOffer): ShopProduct {
  return {
    id: `offer:${offer.id}`,
    name: offer.title,
    hashtag: offer.tagline ? `#${offer.tagline.replace(/\s+/g, "")}` : "#SpecialOffer",
    description: offer.description,
    category: "offer",
    price: offer.price,
    images: offer.image ? [offer.image] : [],
    stock: 99,
    accent: "#DC2626",
    surface: "#fff7ed",
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
  }
}

export function offerIdFromProductId(productId: string) {
  return productId.startsWith("offer:") ? productId.slice("offer:".length) : null
}
