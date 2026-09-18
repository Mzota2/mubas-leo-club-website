"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { applyActionCode, reload } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-leo-primary" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const oobCode = useMemo(() => searchParams.get("oobCode") || "", [searchParams])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError("")
      setSuccess("")

      if (!oobCode) {
        setError("Invalid verification link.")
        setLoading(false)
        return
      }

      try {
        await applyActionCode(auth, oobCode)
        if (auth.currentUser) {
          await reload(auth.currentUser)
        }
        setSuccess("Email verified successfully.")

        if (auth.currentUser) {
          router.replace("/portal/join-fee")
        }
      } catch (err: any) {
        setError(err?.message || "Failed to verify email")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [oobCode, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo size="xl" showText={false} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Email verification</CardTitle>
            <CardDescription>Verification status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {!loading && !auth.currentUser && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Your email is verified. Please log in to continue.
              </p>
              <Button asChild className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white">
                <Link href="/auth/login">Go to login</Link>
              </Button>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
