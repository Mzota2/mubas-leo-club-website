"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { verifyPayment } from "@/lib/paychangu/client"

export default function MembershipReturnPage() {
  const searchParams = useSearchParams()
  const txRef = searchParams.get("txRef") || searchParams.get("transactionId")
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!txRef) {
        setStatus("failed")
        return
      }
      const ok = await verifyPayment(txRef)
      if (!cancelled) setStatus(ok ? "success" : "failed")
    }
    run()
    return () => {
      cancelled = true
    }
  }, [txRef])

  return (
    <div className="px-4 py-10">
      <Card className="mx-auto max-w-md border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Membership payment</CardTitle>
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
                <p className="font-medium">Payment received. Your membership fee is marked paid.</p>
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
            <Link href="/portal/membership">Back to membership</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
