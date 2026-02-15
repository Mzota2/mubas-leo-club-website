"use client"

import { useQuery } from "@tanstack/react-query"
import { getDonations } from "@/lib/firebase/firestore"

export function useDonations(fiscalYear?: string) {
  return useQuery({
    queryKey: ["donations", fiscalYear],
    queryFn: () => getDonations(fiscalYear),
  })
}
