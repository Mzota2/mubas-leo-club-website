"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { sendEmailVerification } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function VerifySentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-leo-primary" />
        </div>
      }
    >
      <VerifySentContent />
    </Suspense>
  )
}

function VerifySentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const email = useMemo(() => searchParams.get("email") || "", [searchParams])

  useEffect(() => {
    if (auth.currentUser?.emailVerified) {
      router.replace("/portal")
    }
  }, [router])

  const handleResend = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const user = auth.currentUser
      if (!user) {
        setError("Please log in again to resend the verification email.")
        return
      }

      const continueUrl = `${window.location.origin}/auth/verify`
      await sendEmailVerification(user, { url: continueUrl, handleCodeInApp: true })
      setSuccess("Verification link sent. Check your inbox.")
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo size="xl" showText={false} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>
              We sent a verification link{email ? ` to ${email}` : ""}. Open the email and click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

          <Button
            type="button"
            className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white"
            onClick={handleResend}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>

          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Already verified?{" "}
              <Link href="/auth/login" className="text-leo-primary hover:underline font-medium">
                Login
              </Link>
            </p>
            <p>
              Wrong email?{" "}
              <Link href="/auth/register" className="text-leo-primary hover:underline font-medium">
                Create a new account
              </Link>
            </p>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
