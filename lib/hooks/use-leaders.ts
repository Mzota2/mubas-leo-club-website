"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createLeader, deleteLeader, getLeaders, updateLeader } from "@/lib/firebase/firestore"
import type { Leader } from "@/lib/types"

export function useLeaders() {
  return useQuery({
    queryKey: ["leaders"],
    queryFn: getLeaders,
  })
}

export function useCreateLeader() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createLeader,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaders"] })
    },
  })
}

export function useUpdateLeader() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leaderId, data }: { leaderId: string; data: Partial<Leader> }) => updateLeader(leaderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaders"] })
    },
  })
}

export function useDeleteLeader() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteLeader,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaders"] })
    },
  })
}
