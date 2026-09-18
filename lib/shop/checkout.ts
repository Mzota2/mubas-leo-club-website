import { getShopProduct } from "@/lib/shop/catalog"
import type { CartItem, OrderItem } from "@/lib/types"

export const DELIVERY_FEE = 2000

export function buildOrderItems(items: CartItem[]): OrderItem[] {
  return items.flatMap((item) => {
    const product = getShopProduct(item.productId)
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
