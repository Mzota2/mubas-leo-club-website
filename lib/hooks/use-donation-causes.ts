"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getDonationCauses, getDonationCause, createDonationCause, updateDonationCause, deleteDonationCause } from "@/lib/firebase/firestore"
import type { DonationCause } from "@/lib/types"

export function useDonationCauses(activeOnly: boolean = false) {
  return useQuery({
    queryKey: ["donationCauses", activeOnly],
    queryFn: () => getDonationCauses(activeOnly),
  })
}

export function useDonationCause(causeId: string) {
  return useQuery({
    queryKey: ["donationCause", causeId],
    queryFn: () => getDonationCause(causeId),
    enabled: !!causeId,
  })
}

export function useCreateDonationCause() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDonationCause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donationCauses"] })
    },
  })
}

export function useUpdateDonationCause() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ causeId, data }: { causeId: string; data: Partial<DonationCause> }) => updateDonationCause(causeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donationCauses"] })
    },
  })
}

export function useDeleteDonationCause() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDonationCause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donationCauses"] })
    },
  })
}
