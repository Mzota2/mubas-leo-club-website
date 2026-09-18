"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!firebaseUser) {
      router.push("/auth/login")
      return
    }

    const usesPasswordProvider = !!firebaseUser?.providerData?.some((p) => p.providerId === "password")
    if (usesPasswordProvider && firebaseUser && !firebaseUser.emailVerified) {
      const email = firebaseUser.email ? `?email=${encodeURIComponent(firebaseUser.email)}` : ""
      router.push(`/auth/verify-sent${email}`)
    }
  }, [user, firebaseUser, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-leo-primary" />
      </div>
    )
  }

  // Firebase auth session exists, but Firestore profile may still be loading/creating.
  if (firebaseUser && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-leo-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const usesPasswordProvider = !!firebaseUser?.providerData?.some((p) => p.providerId === "password")
  if (usesPasswordProvider && firebaseUser && !firebaseUser.emailVerified) {
    return null
  }

  return <>{children}</>
}
