"use client"

import { Suspense, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { PaymentResultScreen } from "@/components/payments/payment-result"
import { verifyPaymentDetails } from "@/lib/paychangu/client"
import { readTxRef } from "@/lib/payments/tx-ref"
import { useCartStore } from "@/lib/store/cart-store"
import type { PaymentReceipt } from "@/lib/payments/types"

export default function ShopCheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center px-4 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-leo-primary" />
        </div>
      }
    >
      <ShopCheckoutReturnContent />
    </Suspense>
  )
}

function ShopCheckoutReturnContent() {
  const searchParams = useSearchParams()
  const txRef = readTxRef(searchParams)
  const clearCart = useCartStore((state) => state.clearCart)
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
      if (result.success) {
        clearCart()
        setStatus("success")
      } else {
        setStatus("failed")
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [clearCart, txRef])

  return (
    <PaymentResultScreen
      title="Shop payment"
      txRef={txRef}
      status={status}
      receipt={receipt}
      successTitle="Payment received. Your shop order is recorded."
      successDetail={`Reference: ${txRef}. We will process delivery next.`}
      failedTitle="We could not confirm this shop payment."
      failedDetail={`If you were charged, share this reference with an admin: ${txRef || "—"}. You can try checkout again.`}
      primaryHref={status === "success" ? "/portal/shop/orders" : "/portal/shop/checkout"}
      primaryLabel={status === "success" ? "View orders" : "Back to checkout"}
      secondaryHref="/portal/payments"
      secondaryLabel="Payment receipts"
    />
  )
}
