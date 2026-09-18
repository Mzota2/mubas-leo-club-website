"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PaymentResultScreen } from "@/components/payments/payment-result"
import { verifyPaymentDetails } from "@/lib/paychangu/client"
import { useAuth } from "@/lib/hooks/use-auth"
import { useUpdateUser } from "@/lib/hooks/use-users"
import { readTxRef } from "@/lib/payments/tx-ref"
import type { PaymentReceipt } from "@/lib/payments/types"

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
  const txRef = readTxRef(searchParams)
  const { user, loading } = useAuth()
  const updateUser = useUpdateUser()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (loading) return
      if (!txRef) {
        setStatus("failed")
        return
      }
      const result = await verifyPaymentDetails(txRef)
      if (result.success && user?.id && !user.joiningFeePaid) {
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
      if (!cancelled) {
        setReceipt(result.receipt ?? null)
        setStatus(result.success ? "success" : "failed")
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [loading, txRef, updateUser, user?.id, user?.joiningFeePaid])

  return (
    <PaymentResultScreen
      title="Joining fee"
      txRef={txRef}
      status={status}
      receipt={receipt}
      successTitle="Joining fee received. You can now take the training quizzes."
      failedTitle="We could not confirm this joining fee payment."
      primaryHref={status === "success" ? "/portal/training" : "/portal/join-fee"}
      primaryLabel={status === "success" ? "Start training" : "Back to joining fee"}
      secondaryHref="/portal/payments"
      secondaryLabel="View payments"
    />
  )
}
