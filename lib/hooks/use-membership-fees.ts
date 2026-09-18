"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMembershipFees, createMembershipFee, updateMembershipFee } from "@/lib/firebase/firestore"
import type { MembershipFee } from "@/lib/types"

export function useMembershipFees(userId?: string, requiredUser = false) {
  return useQuery({
    queryKey: ["membershipFees", userId],
    queryFn: () => getMembershipFees(userId),
    enabled: requiredUser ? Boolean(userId) : true,
  })
}

export function useCreateMembershipFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMembershipFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipFees"] })
    },
  })
}

export function useUpdateMembershipFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ feeId, data }: { feeId: string; data: Partial<MembershipFee> }) => updateMembershipFee(feeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipFees"] })
    },
  })
}
