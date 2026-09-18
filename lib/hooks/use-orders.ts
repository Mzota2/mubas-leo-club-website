"use client"

import { useQuery } from "@tanstack/react-query"
import { getOrders } from "@/lib/firebase/firestore"

export function useOrders(userId?: string, requiredUser = false) {
  return useQuery({
    queryKey: ["orders", userId ?? "all"],
    queryFn: () => getOrders(userId),
    enabled: requiredUser ? Boolean(userId) : true,
  })
}
