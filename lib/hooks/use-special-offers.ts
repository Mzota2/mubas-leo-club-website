"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createSpecialOffer,
  deleteSpecialOffer,
  getSpecialOffer,
  getSpecialOffers,
  updateSpecialOffer,
} from "@/lib/firebase/firestore"
import type { SpecialOffer } from "@/lib/types"

export function useSpecialOffers(activeOnly = false) {
  return useQuery({
    queryKey: ["specialOffers", activeOnly],
    queryFn: () => getSpecialOffers(activeOnly),
  })
}

export function useSpecialOffer(offerId: string) {
  return useQuery({
    queryKey: ["specialOffer", offerId],
    queryFn: () => getSpecialOffer(offerId),
    enabled: !!offerId,
  })
}

export function useCreateSpecialOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSpecialOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialOffers"] })
    },
  })
}

export function useUpdateSpecialOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ offerId, data }: { offerId: string; data: Partial<SpecialOffer> }) =>
      updateSpecialOffer(offerId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["specialOffers"] })
      queryClient.invalidateQueries({ queryKey: ["specialOffer", variables.offerId] })
    },
  })
}

export function useDeleteSpecialOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSpecialOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialOffers"] })
    },
  })
}
