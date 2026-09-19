"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Product } from "@/lib/types"

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: (products?: Product[]) => number
}

function snapshotFromProduct(product: Product, quantity: number, size?: string, color?: string): CartItem {
  return {
    productId: product.id,
    quantity,
    name: product.name,
    price: product.price,
    image: product.images[0],
    ...(size ? { size } : {}),
    ...(color ? { color } : {}),
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, size, color) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id)

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      name: item.name || product.name,
                      price: item.price ?? product.price,
                      image: item.image || product.images[0],
                    }
                  : item,
              ),
            }
          }

          return {
            items: [...state.items, snapshotFromProduct(product, quantity, size, color)],
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: (products) => {
        const items = get().items
        return items.reduce((total, item) => {
          const product = products?.find((entry) => entry.id === item.productId)
          const price = item.price ?? product?.price ?? 0
          return total + price * item.quantity
        }, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
