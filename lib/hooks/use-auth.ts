"use client"

import { useAuth as useAuthContext } from "@/lib/providers/auth-provider"

export function useAuth() {
  return useAuthContext()
}
