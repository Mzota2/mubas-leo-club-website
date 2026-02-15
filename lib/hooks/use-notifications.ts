"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUserNotifications, markNotificationAsRead } from "@/lib/firebase/firestore"
import { useAuth } from "./use-auth"

export function useNotifications() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => (user ? getUserNotifications(user.id) : []),
    enabled: !!user,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
