"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  assignExecutive,
  clearExecutiveAssignment,
  endExecutiveTerm,
  getCurrentExecutives,
} from "@/lib/firebase/firestore"

export function useCurrentExecutives() {
  return useQuery({
    queryKey: ["current-executives"],
    queryFn: async () => {
      try {
        return await getCurrentExecutives()
      } catch {
        return []
      }
    },
  })
}

function invalidateExecutiveQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["users"] })
  queryClient.invalidateQueries({ queryKey: ["current-executives"] })
  queryClient.invalidateQueries({ queryKey: ["leaders"] })
}

export function useAssignExecutive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      ...assignment
    }: {
      userId: string
      position: string
      term: string
      status: "current" | "past"
      order?: number
      bio?: string
      replace?: { position: string; term: string }
    }) => assignExecutive(userId, assignment),
    onSuccess: () => invalidateExecutiveQueries(queryClient),
  })
}

export function useEndExecutiveTerm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: endExecutiveTerm,
    onSuccess: () => invalidateExecutiveQueries(queryClient),
  })
}

export function useClearExecutiveAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: clearExecutiveAssignment,
    onSuccess: () => invalidateExecutiveQueries(queryClient),
  })
}
