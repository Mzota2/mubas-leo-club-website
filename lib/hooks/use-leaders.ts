"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getLeaders } from "@/lib/firebase/firestore"
import type { Leader } from "@/lib/types"

export function useLeaders() {
  return useQuery({
    queryKey: ["leaders"],
    queryFn: async () => {
      try {
        return await getLeaders()
      } catch {
        return []
      }
    },
  })
}
