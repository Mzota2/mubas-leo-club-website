"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAllUsers, updateUser } from "@/lib/firebase/firestore"
import type { User } from "@/lib/types"

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<User> }) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
