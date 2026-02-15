"use client"

import { useQuery } from "@tanstack/react-query"
import { getProducts, getProduct } from "@/lib/firebase/firestore"

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ["products", category],
    queryFn: () => getProducts(category),
  })
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
  })
}
