"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PaymentResultScreen } from "@/components/payments/payment-result"
import { verifyPaymentDetails } from "@/lib/paychangu/client"
import { readTxRef } from "@/lib/payments/tx-ref"
import type { PaymentReceipt } from "@/lib/payments/types"

export default function MembershipReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center px-4 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-leo-primary" />
        </div>
      }
    >
      <MembershipReturnContent />
    </Suspense>
  )
}

function MembershipReturnContent() {
  const searchParams = useSearchParams()
  const txRef = readTxRef(searchParams)
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!txRef) {
        setStatus("failed")
        return
      }
      const result = await verifyPaymentDetails(txRef)
      if (!cancelled) {
        setReceipt(result.receipt ?? null)
        setStatus(result.success ? "success" : "failed")
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [txRef])

  return (
    <PaymentResultScreen
      title="Membership payment"
      txRef={txRef}
      status={status}
      receipt={receipt}
      successTitle="Payment received. Your membership fee is marked paid."
      failedTitle="We could not confirm this membership payment."
      primaryHref="/portal/payments"
      primaryLabel="View payments"
      secondaryHref="/portal/membership"
      secondaryLabel="Back to membership"
    />
  )
}
