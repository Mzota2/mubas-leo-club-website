"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PaymentResultScreen } from "@/components/payments/payment-result"
import { verifyPaymentDetails } from "@/lib/paychangu/client"
import { readTxRef } from "@/lib/payments/tx-ref"
import type { PaymentReceipt } from "@/lib/payments/types"

export default function DonateReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-leo-primary" />
        </div>
      }
    >
      <DonateReturnContent />
    </Suspense>
  )
}

function DonateReturnContent() {
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
      if (cancelled) return
      setReceipt(result.receipt ?? null)
      setStatus(result.success ? "success" : "failed")
    }
    run()
    return () => {
      cancelled = true
    }
  }, [txRef])

  return (
    <PaymentResultScreen
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10"
      title="Donation status"
      txRef={txRef}
      status={status}
      receipt={receipt}
      successTitle="Thank you! Your donation was successful."
      successDetail={`Reference: ${txRef}`}
      failedTitle="We could not confirm your donation."
      failedDetail={`If you were charged, contact support with reference: ${txRef || "—"}`}
      primaryHref="/donate"
      primaryLabel="Back to donate"
      secondaryHref="/portal/payments"
      secondaryLabel="Payment receipts"
    />
  )
}
