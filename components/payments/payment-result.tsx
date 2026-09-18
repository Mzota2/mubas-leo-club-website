"use client"

import Link from "next/link"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReceiptButton } from "@/components/payments/receipt-button"
import type { PaymentReceipt } from "@/lib/payments/types"

export function PaymentResultScreen({
  title,
  txRef,
  status,
  receipt,
  successTitle,
  successDetail,
  failedTitle,
  failedDetail,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className,
}: {
  title: string
  txRef?: string | null
  status: "loading" | "success" | "failed"
  receipt?: PaymentReceipt | null
  successTitle: string
  successDetail?: string
  failedTitle: string
  failedDetail?: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  className?: string
}) {
  return (
    <div className={className ?? "px-4 py-10"}>
      <Card className="mx-auto max-w-md border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" ? (
            <div className="flex items-center gap-2 text-neutral-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying payment with PayChangu...
            </div>
          ) : status === "success" ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-medium">{successTitle}</p>
                <p className="text-sm text-neutral-600">{successDetail || `Reference: ${txRef}`}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-6 w-6 text-red-600" />
              <div>
                <p className="font-medium">{failedTitle}</p>
                <p className="text-sm text-neutral-600">
                  {failedDetail ||
                    `If you were charged, share this reference with an admin: ${txRef || "—"}`}
                </p>
              </div>
            </div>
          )}

          {status === "success" ? <ReceiptButton receipt={receipt} /> : null}

          <Button asChild className="w-full bg-leo-primary text-white">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          {secondaryHref && secondaryLabel ? (
            <Button asChild variant="outline" className="w-full">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
