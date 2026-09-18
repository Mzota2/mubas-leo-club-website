"use client"

import { useQuery } from "@tanstack/react-query"
import { getDonations, getDonationsForUser } from "@/lib/firebase/firestore"

export function useDonations(fiscalYear?: string) {
  return useQuery({
    queryKey: ["donations", fiscalYear],
    queryFn: () => getDonations(fiscalYear),
  })
}

export function useMyDonations(userId?: string, email?: string) {
  return useQuery({
    queryKey: ["donations", "mine", userId, email],
    queryFn: () => getDonationsForUser(userId!, email),
    enabled: Boolean(userId),
  })
}
