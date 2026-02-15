"use client"

import type React from "react"

import { useAuth } from "@/lib/hooks/use-auth"
import type { UserRole } from "@/lib/types"

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || <div className="text-center py-12">You don't have permission to access this content.</div>
  }

  return <>{children}</>
}
