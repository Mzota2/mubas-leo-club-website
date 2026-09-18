"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getPlatformSettings, updatePlatformSettings } from "@/lib/firebase/firestore"
import type { PlatformSettings } from "@/lib/types"
import { defaultMembershipBilling } from "@/lib/membership/billing"

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
  membership: defaultMembershipBilling,
  updatedAt: new Date().toISOString(),
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: ["settings", "platform"],
    queryFn: async () => {
      const settings = (await getPlatformSettings()) ?? defaultSettings
      return {
        ...defaultSettings,
        ...settings,
        notifications: { ...defaultSettings.notifications, ...settings.notifications },
        membership: { ...defaultSettings.membership, ...settings.membership },
      }
    },
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
