"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { verifyPayment } from "@/lib/paychangu/client"

export default function DonateReturnPage() {
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
      if (cancelled) return
      setStatus(ok ? "success" : "failed")
    }

    run()
    return () => {
      cancelled = true
    }
  }, [txRef])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Donation Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "loading" ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying payment...</span>
              </div>
            ) : status === "success" ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Thank you! Your donation was successful.</p>
                  <p className="text-sm text-gray-600">Reference: {txRef}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium">We could not confirm your payment.</p>
                  <p className="text-sm text-gray-600">If you were charged, contact support with reference: {txRef || "-"}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/donate">Back to Donate</Link>
              </Button>
              <Button asChild className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
