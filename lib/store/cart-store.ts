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
  getTotalPrice: (products: Product[]) => number
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
                item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            }
          }

          return {
            items: [...state.items, { productId: product.id, quantity, size, color }],
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
          const product = products.find((p) => p.id === item.productId)
          return total + (product?.price || 0) * item.quantity
        }, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
