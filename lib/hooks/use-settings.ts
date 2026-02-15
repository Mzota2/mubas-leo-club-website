"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getPlatformSettings, updatePlatformSettings } from "@/lib/firebase/firestore"
import type { PlatformSettings } from "@/lib/types"

const defaultSettings: PlatformSettings = {
  clubName: "MUBAS Leo Club",
  clubEmail: "info@mubasleoclub.org",
  clubPhone: "+265 999 123 456",
  clubAddress: "MUBAS Campus, Blantyre, Malawi",
  notifications: {
    eventReminders: true,
    birthdayNotifications: true,
    paymentNotifications: true,
  },
  updatedAt: new Date().toISOString(),
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: ["settings", "platform"],
    queryFn: async () => (await getPlatformSettings()) ?? defaultSettings,
  })
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Omit<PlatformSettings, "updatedAt">) => updatePlatformSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "platform"] })
    },
  })
}
