import { getShopProduct, type ShopProduct } from "@/lib/shop/catalog"
import type { CartItem, OrderItem } from "@/lib/types"

export const DELIVERY_FEE = 2000
export const GUEST_ORDER_USER_ID = "guest"

export function cartLineToProduct(item: CartItem): ShopProduct | null {
  const catalog = getShopProduct(item.productId)
  if (catalog) {
    return {
      ...catalog,
      name: item.name || catalog.name,
      price: item.price ?? catalog.price,
      images: item.image ? [item.image, ...catalog.images.filter((src) => src !== item.image)] : catalog.images,
    }
  }

  if (!item.name || item.price == null) return null

  return {
    id: item.productId,
    name: item.name,
    hashtag: "#SpecialOffer",
    description: "",
    category: "offer",
    price: item.price,
    images: item.image ? [item.image] : [],
    stock: 99,
    accent: "#DC2626",
    surface: "#fff7ed",
    createdAt: "",
    updatedAt: "",
  }
}

export function buildOrderItems(items: CartItem[]): OrderItem[] {
  return items.flatMap((item) => {
    const product = cartLineToProduct(item)
    if (!product) return []
    return [
      {
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        ...(item.size ? { size: item.size } : {}),
        ...(item.color ? { color: item.color } : {}),
      },
    ]
  })
}

export function orderItemsTotal(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
