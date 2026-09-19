"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAllUsers, updateUser } from "@/lib/firebase/firestore"
import { useAuth } from "./use-auth"
import { withoutViewer } from "@/lib/members/viewer"
import type { User } from "@/lib/types"

export function useUsers(includeSelf = false) {
  const { user } = useAuth()
  const query = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  })

  const data = useMemo(() => {
    if (!query.data) return query.data
    if (includeSelf) return query.data
    return withoutViewer(query.data, user?.id)
  }, [includeSelf, query.data, user?.id])

  return { ...query, data }
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<User> }) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["current-executives"] })
      queryClient.invalidateQueries({ queryKey: ["birthday-calendar"] })
    },
  })
}
