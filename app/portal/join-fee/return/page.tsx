"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { verifyPayment } from "@/lib/paychangu/client"
import { useAuth } from "@/lib/hooks/use-auth"
import { useUpdateUser } from "@/lib/hooks/use-users"

export default function JoinFeeReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center px-4 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-leo-primary" />
        </div>
      }
    >
      <JoinFeeReturnContent />
    </Suspense>
  )
}

function JoinFeeReturnContent() {
  const searchParams = useSearchParams()
  const txRef = searchParams.get("txRef") || searchParams.get("transactionId")
  const { user, loading } = useAuth()
  const updateUser = useUpdateUser()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (loading) return
      if (!txRef) {
        setStatus("failed")
        return
      }
      const ok = await verifyPayment(txRef)
      if (ok && user?.id && !user.joiningFeePaid) {
        try {
          await updateUser.mutateAsync({
            userId: user.id,
            data: {
              joiningFeePaid: true,
              joiningFeePaidAt: new Date().toISOString(),
            },
          })
        } catch {
          // Fee record is the source of truth if the profile update is delayed.
        }
      }
      if (!cancelled) setStatus(ok ? "success" : "failed")
    }
    run()
    return () => {
      cancelled = true
    }
  }, [loading, txRef, updateUser, user?.id, user?.joiningFeePaid])

  return (
    <div className="px-4 py-10">
      <Card className="mx-auto max-w-md border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Joining fee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" ? (
            <div className="flex items-center gap-2 text-neutral-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying payment...
            </div>
          ) : status === "success" ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-medium">Joining fee received. You can now take the training quizzes.</p>
                <p className="text-sm text-neutral-600">Reference: {txRef}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-6 w-6 text-red-600" />
              <div>
                <p className="font-medium">We could not confirm this payment yet.</p>
                <p className="text-sm text-neutral-600">If you were charged, share this reference with an admin: {txRef || "—"}</p>
              </div>
            </div>
          )}
          <Button asChild className="w-full bg-leo-primary text-white">
            <Link href={status === "success" ? "/portal/training" : "/portal/join-fee"}>
              {status === "success" ? "Start training" : "Back to joining fee"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
